import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';
const OMDB_API_KEY = process.env.OMDB_API_KEY ?? '9f6b847a';
const EMBED_MODEL = 'text-embedding-3-small';

const ALL_GENRES = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror',
  'Musical', 'Mystery', 'Romance', 'Science Fiction', 'Sport',
  'Thriller', 'War', 'Western',
];

interface GenreIntensities {
  [genre: string]: number;
}

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.data[0].embedding as number[];
}

function buildEmbeddingText(title: string, genres: string, plot: string): string {
  return [
    `Title: ${title}`,
    `Genres: ${genres}`,
    `Summary: ${plot}`,
  ].join(' | ');
}

async function fetchFromSupabase(embedding: number[], excludeTitle: string, topN: number) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_movies`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query_embedding: embedding,
      genre_weights: {},
      match_count: topN + 5,
      exclude_title: excludeTitle,
    }),
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status} ${await res.text()}`);
  return res.json();
}

function rerank(
  results: any[],
  userGenreIntensities: GenreIntensities,
  topN: number
): any[] {
  return results
    .map((movie) => {
      const gi: GenreIntensities = movie.genre_intensities ?? {};
      let genreScore = 0;
      let count = 0;
      for (const genre of ALL_GENRES) {
        const userVal = userGenreIntensities[genre] ?? 0;
        const movieVal = gi[genre] ?? 0;
        if (userVal !== 0 || movieVal !== 0) {
          // dot-product style: high user weight + high movie intensity = good match
          genreScore += userVal * movieVal;
          count++;
        }
      }
      const normalizedGenre = count > 0 ? genreScore / (count * 9) : 0; // max per pair is 3*3=9
      const combined = 0.7 * (movie.similarity ?? 0) + 0.3 * normalizedGenre;
      return { ...movie, combined };
    })
    .sort((a, b) => b.combined - a.combined)
    .slice(0, topN);
}

async function fetchOmdbFallback(title: string) {
  const res = await fetch(
    `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data.Response !== 'True') return null;
  return {
    title: data.Title,
    genres: data.Genre,
    plot: data.Plot,
    imdb_id: data.imdbID,
    poster_path: data.Poster,
    release_date: data.Released,
    runtime: data.Runtime,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'Server misconfigured: missing SUPABASE_URL, SUPABASE_SERVICE_KEY, or OPENAI_API_KEY env vars.',
    });
  }

  const { title, genre_intensities, top_n = 10 } = req.body as {
    title: string;
    genre_intensities: GenreIntensities;
    top_n?: number;
  };

  if (!title) return res.status(400).json({ error: 'title is required' });

  try {
    // Try to find movie in Supabase first (cheap title lookup)
    const titleLookup = await fetch(
      `${SUPABASE_URL}/rest/v1/movies?select=title,genres,summary,genre_intensities&title=ilike.${encodeURIComponent(title)}&limit=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );
    const titleRows = await titleLookup.json();

    let embeddingText: string;

    if (titleRows.length > 0) {
      const m = titleRows[0];
      embeddingText = buildEmbeddingText(m.title, m.genres, m.summary);
    } else {
      // Fallback: fetch from OMDB
      const omdb = await fetchOmdbFallback(title);
      if (!omdb) {
        return res.status(404).json({ error: `Movie "${title}" not found` });
      }
      embeddingText = buildEmbeddingText(omdb.title, omdb.genres, omdb.plot);
    }

    const embedding = await getEmbedding(embeddingText);
    const rawResults = await fetchFromSupabase(embedding, title, top_n);
    const reranked = rerank(rawResults, genre_intensities, top_n);

    const TMDB_BASE = 'https://image.tmdb.org/t/p/w500';
    const output = reranked.map((m) => ({
      title: m.title,
      genres: m.genres,
      genre_intensities: m.genre_intensities,
      imdb_id: m.imdb_id,
      poster_path: m.poster_path
        ? m.poster_path.startsWith('http')
          ? m.poster_path
          : `${TMDB_BASE}${m.poster_path}`
        : '',
      release_date: m.release_date,
      runtime: m.runtime,
    }));

    return res.status(200).json(output);
  } catch (err: any) {
    console.error('Recommend error:', err);
    return res.status(500).json({ error: err.message ?? 'Internal server error' });
  }
}
