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
from typing import Any

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


def batch_upsert_embeddings(rows: list[dict], retries: int = 3) -> bool:
    """Upsert a batch of {id, embedding} rows via Supabase upsert."""
    for attempt in range(retries):
        try:
            r = requests.post(
                f"{SUPABASE_URL}/rest/v1/movies",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "resolution=merge-duplicates",
                },
                json=rows,
                timeout=60,
            )
            if r.status_code in (200, 201):
                return True
            print(f"  Upsert error {r.status_code}: {r.text[:200]}")
        except requests.exceptions.Timeout:
            wait = 10 * (attempt + 1)
            print(f"  Timeout on upsert, retrying in {wait}s...")
            time.sleep(wait)
        except Exception as e:
            print(f"  Upsert exception: {e}")
            time.sleep(5)
    return False


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

    progress_file = "./scripts/reembed_progress.json"
    done_ids: set = set()
    if os.path.exists(progress_file):
        with open(progress_file) as f:
            done_ids = set(json.load(f))
        print(f"Resuming — {len(done_ids)} already done")

    remaining = [m for m in all_movies if m["id"] not in done_ids]
    print(f"Remaining to embed: {len(remaining)}")

    updated = len(done_ids)
    for start in range(0, len(remaining), BATCH_SIZE):
        batch = remaining[start:start + BATCH_SIZE]
        texts = [build_weighted_embedding_text(m) for m in batch]

        print(f"Embedding batch {start}–{start + len(batch) - 1} / {len(remaining)}...")
        embeddings = get_embeddings(texts)

        upsert_rows = [
            {"id": movie["id"], "embedding": emb}
            for movie, emb in zip(batch, embeddings)
        ]

        if batch_upsert_embeddings(upsert_rows):
            updated += len(batch)
            for movie in batch:
                done_ids.add(movie["id"])
            with open(progress_file, "w") as f:
                json.dump(list(done_ids), f)
        else:
            print(f"  Batch failed, will retry on next run")

        print(f"  Updated {updated}/{total} so far")
        time.sleep(0.5)

    print(f"\nDone. Re-embedded {updated}/{total} movies.")


if __name__ == "__main__":
    main()
