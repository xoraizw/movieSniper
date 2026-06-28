"""
Re-embed all movies in Supabase using weighted field representation.

Weights (matching original pipeline):
  genre_intensities  30%  — serialized as text, repeated 3x
  summary            25%  — repeated 2-3x
  description        20%  — repeated 2x
  title              10%  — repeated 1x
  reviews            10%  — first 500 chars, repeated 1x
  keywords            5%  — repeated 1x
  tagline             5%  — repeated 1x

Weights are approximated via field repetition so the embedding
space reflects each field's relative importance.

Run from project root:
  OPENAI_API_KEY=sk-... python scripts/reembed_movies.py
"""

import os
import sys
import time
import json
import requests

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://jayxstotsvlseemmdtxa.supabase.co")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
EMBED_MODEL = "text-embedding-3-small"
BATCH_SIZE = 100
PAGE_SIZE = 500

ALL_GENRES = [
    "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
    "Documentary", "Drama", "Family", "Fantasy", "History", "Horror",
    "Musical", "Mystery", "Romance", "Science Fiction", "Sport",
    "Thriller", "War", "Western",
]


def build_weighted_embedding_text(row: dict) -> str:
    title       = (row.get("title") or "").strip()
    summary     = (row.get("summary") or "").strip()
    description = (row.get("description") or "").strip()
    reviews     = (row.get("reviews") or "").strip()[:600]
    keywords    = (row.get("keywords") or "").strip()
    tagline     = (row.get("tagline") or "").strip()
    genres      = (row.get("genres") or "").strip()
    gi          = row.get("genre_intensities") or {}

    # Serialize genre intensities as readable text
    gi_parts = [f"{g}: {gi[g]:+d}" for g in ALL_GENRES if g in gi and gi[g] != 0]
    gi_text = ", ".join(gi_parts) if gi_parts else genres  # fall back to genres string

    parts = []

    # genre_intensities ~30% — repeat 3x
    if gi_text:
        parts += [f"Genre profile: {gi_text}"] * 3

    # summary ~25% — repeat 3x (short field so 3x ≈ weight)
    if summary:
        parts += [f"Summary: {summary}"] * 3

    # description ~20% — repeat 2x
    if description and description != summary:
        parts += [f"Description: {description}"] * 2

    # title ~10% — repeat 1x
    if title:
        parts.append(f"Title: {title}")

    # reviews ~10% — repeat 1x (already truncated to 600 chars)
    if reviews:
        parts.append(f"Reviews: {reviews}")

    # keywords ~5% — repeat 1x
    if keywords:
        parts.append(f"Keywords: {keywords}")

    # tagline ~5% — repeat 1x
    if tagline:
        parts.append(f"Tagline: {tagline}")

    return " | ".join(parts)


def get_embeddings(texts: list[str]) -> list[list[float]]:
    r = requests.post(
        "https://api.openai.com/v1/embeddings",
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
        json={"model": EMBED_MODEL, "input": texts},
        timeout=60,
    )
    r.raise_for_status()
    return [item["embedding"] for item in r.json()["data"]]


def fetch_page(offset: int) -> list[dict]:
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/movies?select=id,title,summary,description,reviews,keywords,tagline,genres,genre_intensities",
        headers={
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Range": f"{offset}-{offset + PAGE_SIZE - 1}",
            "Range-Unit": "items",
        },
        timeout=30,
    )
    return r.json()


def update_embedding(movie_id: int, embedding: list[float]):
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/movies?id=eq.{movie_id}",
        headers={
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json",
        },
        json={"embedding": embedding},
        timeout=30,
    )
    return r.status_code in (200, 204)


def main():
    if not OPENAI_API_KEY:
        print("ERROR: Set OPENAI_API_KEY env var.")
        sys.exit(1)
    if not SUPABASE_SERVICE_KEY:
        print("ERROR: Set SUPABASE_SERVICE_KEY env var.")
        sys.exit(1)

    print("Fetching movies from Supabase...")
    all_movies = []
    offset = 0
    while True:
        page = fetch_page(offset)
        if not page or not isinstance(page, list):
            break
        all_movies.extend(page)
        print(f"  Fetched {len(all_movies)} movies...")
        if len(page) < PAGE_SIZE:
            break
        offset += PAGE_SIZE

    total = len(all_movies)
    print(f"Total movies to re-embed: {total}")

    updated = 0
    for start in range(0, total, BATCH_SIZE):
        batch = all_movies[start:start + BATCH_SIZE]
        texts = [build_weighted_embedding_text(m) for m in batch]

        print(f"Embedding batch {start}–{start + len(batch) - 1} / {total}...")
        embeddings = get_embeddings(texts)

        for movie, emb in zip(batch, embeddings):
            if update_embedding(movie["id"], emb):
                updated += 1
            else:
                print(f"  Failed to update: {movie['title']}")

        print(f"  Updated {updated}/{total} so far")
        time.sleep(0.3)

    print(f"\nDone. Re-embedded {updated}/{total} movies.")


if __name__ == "__main__":
    main()
