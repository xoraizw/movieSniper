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

const ALL_GENRES_LIST = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror',
  'Musical', 'Mystery', 'Romance', 'Science Fiction', 'Sport',
  'Thriller', 'War', 'Western',
];

function buildEmbeddingText(
  title: string,
  genres: string,
  summary: string,
  genreIntensities: GenreIntensities = {},
  keywords = '',
  tagline = '',
  description = '',
  reviews = '',
): string {
  const giParts = ALL_GENRES_LIST
    .filter(g => genreIntensities[g] !== undefined && genreIntensities[g] !== 0)
    .map(g => `${g}: ${genreIntensities[g] > 0 ? '+' : ''}${genreIntensities[g]}`);
  const giText = giParts.length > 0 ? giParts.join(', ') : genres;

  const parts: string[] = [];

  // genre_intensities ~30% — repeat 3x
  if (giText)                              parts.push(...Array(3).fill(`Genre profile: ${giText}`));
  // summary ~25% — repeat 3x
  if (summary)                             parts.push(...Array(3).fill(`Summary: ${summary}`));
  // description ~20% — repeat 2x
  if (description && description !== summary) parts.push(...Array(2).fill(`Description: ${description}`));
  // title ~10%
  if (title)                               parts.push(`Title: ${title}`);
  // reviews ~10%
  if (reviews)                             parts.push(`Reviews: ${reviews.slice(0, 600)}`);
  // keywords ~5%
  if (keywords)                            parts.push(`Keywords: ${keywords}`);
  // tagline ~5%
  if (tagline)                             parts.push(`Tagline: ${tagline}`);

  return parts.join(' | ');
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
      match_count: topN + 20,
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
      const combined = 0.5 * (movie.similarity ?? 0) + 0.5 * normalizedGenre;
      return { ...movie, combined };
    })
    .sort((a, b) => b.combined - a.combined)
    .slice(0, topN);
}

async function fetchOmdbFallback(title: string) {
  const res = await fetch(
    `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&plot=full&apikey=${OMDB_API_KEY}`
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
    keywords: data.Keywords ?? '',
    tagline: data.Tagline ?? '',
  };
}

async function fetchImdbReviews(imdbId: string): Promise<string> {
  try {
    const res = await fetch(`https://www.imdb.com/title/${imdbId}/reviews`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const html = await res.text();
    // Extract review text between show-more__control divs
    const matches = [...html.matchAll(/class="text show-more__control"[^>]*>([\s\S]*?)<\/div>/g)];
    const reviews = matches.slice(0, 3).map(m =>
      m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    );
    return reviews.join('\n');
  } catch {
    return '';
  }
}

async function generateGenreIntensities(
  title: string, genres: string, plot: string, keywords: string, tagline: string
): Promise<GenreIntensities> {
  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? '';
  if (!OPENROUTER_KEY) return {};
  try {
    const prompt = `You are the average movie viewer. Analyze the intensity of each genre in this list for the movie below: ${ALL_GENRES_LIST.join(', ')}
Rating scheme: -3 (very low) to +3 (extreme), 0 = neutral.
title: ${title}
genres: ${genres}
tagline: ${tagline}
keywords: ${keywords}
summary: ${plot}
Output ONLY a JSON object with every genre as keys. Example: {"Action": 1, "Drama": 2, "Comedy": -1}
No explanations, no extra text.`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENROUTER_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'system', content: 'You are a movie genre rating assistant. Output only valid JSON.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    const data = await res.json();
    if (!data.choices) return {};
    const content = data.choices[0].message.content.trim()
      .replace(/```json\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(content) as GenreIntensities;
  } catch {
    return {};
  }
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
      `${SUPABASE_URL}/rest/v1/movies?select=title,genres,summary,description,reviews,keywords,tagline,genre_intensities&title=ilike.${encodeURIComponent(title)}&limit=1`,
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
      embeddingText = buildEmbeddingText(m.title, m.genres, m.summary, m.genre_intensities ?? {}, m.keywords ?? '', m.tagline ?? '', m.description ?? '', m.reviews ?? '');
    } else {
      // Unknown movie — fetch from OMDB, enrich fully, then store
      const omdb = await fetchOmdbFallback(title);
      if (!omdb) {
        return res.status(404).json({ error: `Movie "${title}" not found` });
      }

      // Fetch reviews + genre intensities in parallel while we have OMDB data
      const [reviews, genreIntensities] = await Promise.all([
        fetchImdbReviews(omdb.imdb_id),
        generateGenreIntensities(omdb.title, omdb.genres, omdb.plot, omdb.keywords ?? '', omdb.tagline ?? ''),
      ]);

      // Build fully weighted embedding text
      embeddingText = buildEmbeddingText(
        omdb.title, omdb.genres, omdb.plot,
        genreIntensities, omdb.keywords ?? '', omdb.tagline ?? '',
        omdb.plot, reviews,
      );

      // Generate embedding once — reuse for both search and storage
      const newEmbedding = await getEmbedding(embeddingText);

      // Insert fully enriched movie — await so it's saved before returning results
      await fetch(`${SUPABASE_URL}/rest/v1/movies`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify([{
          imdb_id: omdb.imdb_id,
          title: omdb.title,
          release_date: omdb.release_date,
          runtime: omdb.runtime,
          poster_path: omdb.poster_path,
          genres: omdb.genres,
          summary: omdb.plot,
          description: omdb.plot,
          keywords: omdb.keywords ?? '',
          tagline: omdb.tagline ?? '',
          reviews,
          genre_intensities: genreIntensities,
          embedding: newEmbedding,
          enriched: true,
        }]),
      }).catch(() => {}); // non-fatal if insert fails

      // Use the already-generated embedding directly for search
      const rawResults = await fetchFromSupabase(newEmbedding, title, top_n);
      const reranked = rerank(rawResults, genre_intensities, top_n);
      const TMDB_BASE = 'https://image.tmdb.org/t/p/w500';
      const output = reranked.map((m) => ({
        title: m.title,
        genres: m.genres,
        genre_intensities: m.genre_intensities,
        imdb_id: m.imdb_id,
        poster_path: m.poster_path
          ? m.poster_path.startsWith('http') ? m.poster_path : `${TMDB_BASE}${m.poster_path}`
          : '',
        release_date: m.release_date,
        runtime: m.runtime,
      }));
      return res.status(200).json(output);
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
