import pandas as pd
import ast
import json
import time
import os
import requests

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://jayxstotsvlseemmdtxa.supabase.co")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

EMBED_MODEL = "text-embedding-3-small"
BATCH_SIZE = 100  # OpenAI embeddings batch limit


def parse_genre_intensities(s):
    if isinstance(s, str):
        s = s.strip("```python\n").strip("```").strip()
        try:
            return ast.literal_eval(s)
        except Exception:
            return {}
    return {}


def build_embedding_text(row):
    parts = [
        f"Title: {row.get('title', '')}",
        f"Genres: {row.get('genres', '')}",
        f"Keywords: {row.get('keywords', '')}",
        f"Tagline: {row.get('tagline', '')}",
        f"Summary: {row.get('summary', '')}",
        f"Description: {row.get('description', '')}",
    ]
    return " | ".join(p for p in parts if p.split(": ", 1)[1])


def get_embeddings(texts):
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    body = {"model": EMBED_MODEL, "input": texts}
    resp = requests.post("https://api.openai.com/v1/embeddings", headers=headers, json=body)
    resp.raise_for_status()
    data = resp.json()
    return [item["embedding"] for item in data["data"]]


def insert_movies(rows):
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/movies",
        headers=headers,
        json=rows,
    )
    if resp.status_code not in (200, 201):
        print(f"Insert error {resp.status_code}: {resp.text[:300]}")
    else:
        print(f"  Inserted {len(rows)} rows OK")


def main():
    if not OPENAI_API_KEY:
        print("ERROR: Set OPENAI_API_KEY env var before running.")
        return
    if not SUPABASE_SERVICE_KEY:
        print("ERROR: Set SUPABASE_SERVICE_KEY env var before running.")
        return

    df = pd.read_csv("./movies_with_genre_intensities.csv")
    df = df[df["processed"].fillna(False)].copy()
    df.fillna("", inplace=True)
    df["genre_intensities"] = df["genre_intensities"].apply(parse_genre_intensities)

    print(f"Loaded {len(df)} processed movies")

    records = df.to_dict(orient="records")
    total = len(records)

    for start in range(0, total, BATCH_SIZE):
        batch = records[start : start + BATCH_SIZE]
        print(f"Processing rows {start}–{start + len(batch) - 1} / {total}")

        texts = [build_embedding_text(r) for r in batch]
        embeddings = get_embeddings(texts)

        rows_to_insert = []
        for r, emb in zip(batch, embeddings):
            rows_to_insert.append({
                "tmdb_id": str(r.get("id", "")),
                "imdb_id": r.get("imdb_id", ""),
                "title": r.get("title", ""),
                "release_date": r.get("release_date", ""),
                "runtime": str(r.get("runtime", "")),
                "poster_path": r.get("poster_path", ""),
                "tagline": r.get("tagline", ""),
                "genres": r.get("genres", ""),
                "keywords": r.get("keywords", ""),
                "summary": r.get("summary", ""),
                "description": r.get("description", ""),
                "reviews": r.get("reviews", ""),
                "genre_intensities": r.get("genre_intensities", {}),
                "embedding": emb,
            })

        insert_movies(rows_to_insert)
        time.sleep(0.5)  # avoid rate limits

    print("Migration complete.")


if __name__ == "__main__":
    main()
