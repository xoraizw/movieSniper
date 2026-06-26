"""
Import TMDB 5000 dataset into Supabase.

For each movie not already in Supabase:
  1. Parse genres/keywords from JSON columns
  2. Fetch poster_path + imdb_id from OMDB
  3. Generate genre intensities via OpenRouter (llama-3.1-8b, same as original pipeline)
  4. Generate embedding via OpenAI text-embedding-3-small
  5. Insert into Supabase movies table

Run from project root:
  OPENAI_API_KEY=sk-... python scripts/import_tmdb5000.py

Progress is saved to scripts/import_progress.json so you can resume if interrupted.
"""

import pandas as pd
import json
import ast
import time
import os
import requests
import sys

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://jayxstotsvlseemmdtxa.supabase.co")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
OMDB_API_KEY = os.environ.get("OMDB_API_KEY", "9f6b847a")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

EMBED_MODEL = "text-embedding-3-small"
EMBED_BATCH = 50
PROGRESS_FILE = "./scripts/import_progress.json"

ALL_GENRES = [
    "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
    "Documentary", "Drama", "Family", "Fantasy", "History", "Horror",
    "Musical", "Mystery", "Romance", "Science Fiction", "Sport",
    "Thriller", "War", "Western",
]


# ── helpers ──────────────────────────────────────────────────────────────────

def parse_json_list(s, key="name"):
    try:
        items = json.loads(s) if isinstance(s, str) else s
        return ", ".join(i[key] for i in items if key in i)
    except Exception:
        return ""


def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return set(json.load(f))
    return set()


def save_progress(done_titles):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(list(done_titles), f)


def fetch_omdb(title, year=""):
    params = {"t": title, "apikey": OMDB_API_KEY}
    if year:
        params["y"] = str(year)[:4]
    try:
        r = requests.get("http://www.omdbapi.com/", params=params, timeout=8)
        data = r.json()
        if data.get("Response") == "True":
            return data.get("imdbID", ""), data.get("Poster", "")
    except Exception:
        pass
    return "", ""


def generate_genre_intensities(movie):
    prompt = f"""
You are the average movie viewer.
Using the taglines, keywords, summary, description of the movie to analyze the intensity of each genre in this list: {ALL_GENRES}
This is the rating scheme: -3 (low intensity) to +3 (extreme intensity) with 0 being normal intensity.
title: {movie['title']}
tagline: {movie.get('tagline', '')}
keywords: {movie.get('keywords', '')}
summary: {movie.get('summary', '')}
Give your ratings for all genres present in the movie in the form of a python dictionary with the keys being each genre and the
corresponding value being the rating you assign.
An example of the output: {{'Action': -1, 'Adventure': +2, ...}}
Don't provide any explanations. Output only the python dictionary covering every genre in: {ALL_GENRES}.
"""
    try:
        r = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
            json={
                "model": "meta-llama/llama-3.1-8b-instruct:free",
                "messages": [
                    {"role": "system", "content": "You are a movie genre rating assistant."},
                    {"role": "user", "content": prompt},
                ],
            },
            timeout=30,
        )
        content = r.json()["choices"][0]["message"]["content"]
        content = content.strip("```python\n").strip("```").strip()
        return ast.literal_eval(content)
    except Exception as e:
        print(f"    Genre intensity error: {e}")
        return {g: 0 for g in ALL_GENRES}


def get_embeddings(texts):
    r = requests.post(
        "https://api.openai.com/v1/embeddings",
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
        json={"model": EMBED_MODEL, "input": texts},
        timeout=60,
    )
    r.raise_for_status()
    return [item["embedding"] for item in r.json()["data"]]


def insert_movies(rows):
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/movies",
        headers={
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
        },
        json=rows,
        timeout=30,
    )
    if r.status_code not in (200, 201):
        print(f"    Insert error {r.status_code}: {r.text[:200]}")
        return False
    return True


def get_existing_titles():
    """Fetch all titles already in Supabase."""
    titles = set()
    offset = 0
    limit = 1000
    while True:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/movies?select=title&limit={limit}&offset={offset}",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            },
            timeout=30,
        )
        rows = r.json()
        if not rows:
            break
        titles.update(row["title"].lower() for row in rows)
        if len(rows) < limit:
            break
        offset += limit
    return titles


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    if not OPENAI_API_KEY:
        print("ERROR: Set OPENAI_API_KEY env var.")
        sys.exit(1)
    if not SUPABASE_SERVICE_KEY:
        print("ERROR: Set SUPABASE_SERVICE_KEY env var.")
        sys.exit(1)

    movies_df = pd.read_csv("./tmdb_data/tmdb_5000_movies.csv")
    movies_df.fillna("", inplace=True)

    # Sort by popularity so best movies come first
    movies_df = movies_df.sort_values("popularity", ascending=False).reset_index(drop=True)

    print("Fetching existing titles from Supabase...")
    existing_titles = get_existing_titles()
    print(f"  Already in DB: {len(existing_titles)}")

    done_titles = load_progress()

    # Filter to only new movies
    to_process = [
        row for _, row in movies_df.iterrows()
        if row["title"].lower() not in existing_titles
        and row["title"].lower() not in done_titles
        and row.get("overview", "")  # skip movies with no plot
    ]
    print(f"Movies to import: {len(to_process)}")

    batch_rows = []
    batch_texts = []
    inserted_total = 0

    for i, row in enumerate(to_process):
        title = row["title"]
        year = str(row.get("release_date", ""))[:4]
        print(f"[{i+1}/{len(to_process)}] {title} ({year})")

        genres_str = parse_json_list(row["genres"])
        keywords_str = parse_json_list(row["keywords"])
        summary = row.get("overview", "")
        tagline = row.get("tagline", "")
        runtime = str(int(row["runtime"])) if row.get("runtime") else ""

        # OMDB for poster + imdb_id
        imdb_id, poster_path = fetch_omdb(title, year)
        if not imdb_id:
            print(f"    OMDB miss — skipping")
            done_titles.add(title.lower())
            continue

        # Genre intensities via OpenRouter
        genre_intensities = generate_genre_intensities({
            "title": title,
            "tagline": tagline,
            "keywords": keywords_str,
            "summary": summary,
        })

        embedding_text = " | ".join(filter(None, [
            f"Title: {title}",
            f"Genres: {genres_str}",
            f"Keywords: {keywords_str}",
            f"Tagline: {tagline}",
            f"Summary: {summary}",
        ]))

        batch_rows.append({
            "tmdb_id": str(row.get("id", "")),
            "imdb_id": imdb_id,
            "title": title,
            "release_date": row.get("release_date", ""),
            "runtime": runtime,
            "poster_path": poster_path,
            "tagline": tagline,
            "genres": genres_str,
            "keywords": keywords_str,
            "summary": summary,
            "description": summary,
            "reviews": "",
            "genre_intensities": genre_intensities,
        })
        batch_texts.append(embedding_text)
        done_titles.add(title.lower())

        # Insert in batches of EMBED_BATCH
        if len(batch_rows) >= EMBED_BATCH:
            print(f"  Generating {len(batch_rows)} embeddings...")
            embeddings = get_embeddings(batch_texts)
            for r2, emb in zip(batch_rows, embeddings):
                r2["embedding"] = emb
            if insert_movies(batch_rows):
                inserted_total += len(batch_rows)
                print(f"  Inserted {len(batch_rows)} rows (total: {inserted_total})")
            batch_rows, batch_texts = [], []
            save_progress(done_titles)
            time.sleep(0.3)

    # Insert remaining
    if batch_rows:
        print(f"  Generating {len(batch_rows)} final embeddings...")
        embeddings = get_embeddings(batch_texts)
        for r2, emb in zip(batch_rows, embeddings):
            r2["embedding"] = emb
        if insert_movies(batch_rows):
            inserted_total += len(batch_rows)
            print(f"  Inserted {len(batch_rows)} rows (total: {inserted_total})")
        save_progress(done_titles)

    print(f"\nDone. Total inserted: {inserted_total}")


if __name__ == "__main__":
    main()
