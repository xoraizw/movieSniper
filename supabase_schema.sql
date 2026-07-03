-- Enable pgvector extension
create extension if not exists vector;

-- Movies table
create table if not exists movies (
  id bigserial primary key,
  tmdb_id text,
  imdb_id text,
  title text not null,
  release_date text,
  runtime text,
  poster_path text,
  tagline text,
  genres text,
  keywords text,
  summary text,
  description text,
  reviews text,
  genre_intensities jsonb,
  embedding vector(1536)
);

-- Index for fast vector similarity search
create index if not exists movies_embedding_idx
  on movies using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Index for title lookup
create index if not exists movies_title_idx on movies (lower(title));

-- Function to update only the embedding column for a movie
create or replace function update_movie_embedding(movie_id bigint, new_embedding vector(1536))
returns void language plpgsql as $$
begin
  update movies set embedding = new_embedding where id = movie_id;
end;
$$;

-- Function for similarity search
create or replace function match_movies(
  query_embedding vector(1536),
  genre_weights jsonb,
  match_count int default 10,
  exclude_title text default ''
)
returns table (
  id bigint,
  title text,
  imdb_id text,
  genres text,
  genre_intensities jsonb,
  poster_path text,
  release_date text,
  runtime text,
  similarity float
)
language plpgsql
as $$
begin
  set local ivfflat.probes = 20;
  return query
  select
    m.id,
    m.title,
    m.imdb_id,
    m.genres,
    m.genre_intensities,
    m.poster_path,
    m.release_date,
    m.runtime,
    1 - (m.embedding <=> query_embedding) as similarity
  from movies m
  where lower(m.title) != lower(exclude_title)
    and m.embedding is not null
    and m.enriched = true
  order by m.embedding <=> query_embedding
  limit match_count;
end;
$$;
