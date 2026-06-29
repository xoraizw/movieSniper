"""
Backfill missing fields for movies in Supabase where enriched = false.

For each unenriched movie:
  1. Fetch full plot (description) from OMDB (?plot=full)
  2. Scrape top 3 reviews from IMDb
  3. Generate genre intensities via OpenRouter
  4. Re-embed with weighted text (same weights as reembed_movies.py)
  5. Update Supabase and mark enriched = true

Run from project root:
  OPENAI_API_KEY=sk-... python scripts/backfill_missing_fields.py

Safe to re-run — skips already enriched movies.
"""

import os
import sys
import time
import json
import ast
import requests
from bs4 import BeautifulSoup

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://jayxstotsvlseemmdtxa.supabase.co")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
OMDB_API_KEY = os.environ.get("OMDB_API_KEY", "9f6b847a")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
EMBED_MODEL = "text-embedding-3-small"
PAGE_SIZE = 200

ALL_GENRES = [
    "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
    "Documentary", "Drama", "Family", "Fantasy", "History", "Horror",
    "Musical", "Mystery", "Romance", "Science Fiction", "Sport",
    "Thriller", "War", "Western",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


# ── field fetchers ────────────────────────────────────────────────────────────

def fetch_full_plot(imdb_id: str) -> str:
    """Fetch full plot from OMDB."""
    try:
        r = requests.get(
            "http://www.omdbapi.com/",
            params={"i": imdb_id, "plot": "full", "apikey": OMDB_API_KEY},
            timeout=8,
        )
        data = r.json()
        if data.get("Response") == "True":
            return data.get("Plot", "")
    except Exception as e:
        print(f"    OMDB plot error: {e}")
    return ""


def fetch_imdb_reviews(imdb_id: str) -> str:
    """Scrape top 3 user reviews from IMDb."""
    try:
        url = f"https://www.imdb.com/title/{imdb_id}/reviews"
        r = requests.get(url, headers=HEADERS, timeout=12)
        soup = BeautifulSoup(r.content, "html.parser")
        divs = soup.find_all("div", class_="text show-more__control", limit=3)
        reviews = [d.get_text(strip=True) for d in divs]
        return "\n".join(reviews)
    except Exception as e:
        print(f"    IMDb review error: {e}")
    return ""


def generate_genre_intensities(title: str, tagline: str, keywords: str, summary: str) -> dict:
    """Call OpenRouter to score genre intensities -3 to +3."""
    prompt = f"""
You are the average movie viewer.
Analyze the intensity of each genre in this list for the movie below: {ALL_GENRES}
Rating scheme: -3 (very low) to +3 (extreme), 0 = neutral.
title: {title}
tagline: {tagline}
keywords: {keywords}
summary: {summary}
Output ONLY a Python dictionary with every genre from the list as keys.
Example: {{'Action': 1, 'Drama': 2, 'Comedy': -1, ...}}
No explanations, no extra text.
"""
    for attempt in range(4):
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
            data = r.json()
            if "choices" not in data:
                wait = 15 * (attempt + 1)
                print(f"    Rate limited, waiting {wait}s...")
                time.sleep(wait)
                continue
            content = data["choices"][0]["message"]["content"]
            content = content.strip("```python\n").strip("```").strip()
            return ast.literal_eval(content)
        except Exception as e:
            print(f"    Genre intensity error (attempt {attempt+1}): {e}")
            time.sleep(5)
    return {g: 0 for g in ALL_GENRES}


def build_weighted_embedding_text(row: dict) -> str:
    """Build weighted embedding text matching the original pipeline weights."""
    title       = (row.get("title") or "").strip()
    summary     = (row.get("summary") or "").strip()
    description = (row.get("description") or "").strip()
    reviews     = (row.get("reviews") or "").strip()[:600]
    keywords    = (row.get("keywords") or "").strip()
    tagline     = (row.get("tagline") or "").strip()
    genres      = (row.get("genres") or "").strip()
    gi          = row.get("genre_intensities") or {}

    gi_parts = [f"{g}: {gi[g]:+d}" for g in ALL_GENRES if g in gi and gi[g] != 0]
    gi_text = ", ".join(gi_parts) if gi_parts else genres

    parts = []
    if gi_text:        parts += [f"Genre profile: {gi_text}"] * 3
    if summary:        parts += [f"Summary: {summary}"] * 3
    if description and description != summary:
                       parts += [f"Description: {description}"] * 2
    if title:          parts.append(f"Title: {title}")
    if reviews:        parts.append(f"Reviews: {reviews}")
    if keywords:       parts.append(f"Keywords: {keywords}")
    if tagline:        parts.append(f"Tagline: {tagline}")

    return " | ".join(parts)


def get_embedding(text: str) -> list:
    r = requests.post(
        "https://api.openai.com/v1/embeddings",
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
        json={"model": EMBED_MODEL, "input": text},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["data"][0]["embedding"]


# ── Supabase helpers ──────────────────────────────────────────────────────────

def fetch_unenriched(offset: int) -> list:
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/movies?select=id,title,imdb_id,summary,description,reviews,keywords,tagline,genres,genre_intensities&enriched=is.false&order=id",
        headers={
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Range": f"{offset}-{offset + PAGE_SIZE - 1}",
            "Range-Unit": "items",
            "Prefer": "count=exact",
        },
        timeout=30,
    )
    return r.json() if isinstance(r.json(), list) else []


def update_movie(movie_id: int, fields: dict, embedding: list) -> bool:
    """Update movie fields + embedding + mark enriched=true."""
    payload = {**fields, "enriched": True}

    # Update fields first
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/movies?id=eq.{movie_id}",
        headers={
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )
    if r.status_code not in (200, 204):
        print(f"    Field update error {r.status_code}: {r.text[:150]}")
        return False

    # Update embedding via RPC
    r2 = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/update_movie_embedding",
        headers={
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json",
        },
        json={"movie_id": movie_id, "new_embedding": embedding},
        timeout=30,
    )
    return r2.status_code in (200, 204)


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    if not OPENAI_API_KEY:
        print("ERROR: Set OPENAI_API_KEY"); sys.exit(1)
    if not SUPABASE_SERVICE_KEY:
        print("ERROR: Set SUPABASE_SERVICE_KEY"); sys.exit(1)
    if not OPENROUTER_API_KEY:
        print("ERROR: Set OPENROUTER_API_KEY"); sys.exit(1)

    print("Fetching unenriched movies...")
    all_movies = []
    offset = 0
    while True:
        page = fetch_unenriched(offset)
        if not page:
            break
        all_movies.extend(page)
        print(f"  Fetched {len(all_movies)} unenriched so far...")
        if len(page) < PAGE_SIZE:
            break
        offset += PAGE_SIZE

    total = len(all_movies)
    print(f"Total to enrich: {total}")

    enriched_count = 0
    for i, movie in enumerate(all_movies):
        title   = movie.get("title", "")
        imdb_id = movie.get("imdb_id", "")
        print(f"[{i+1}/{total}] {title} ({imdb_id})")

        if not imdb_id:
            print("    No IMDb ID — skipping")
            continue

        # 1. Full plot / description
        description = fetch_full_plot(imdb_id)
        print(f"    Description: {len(description)} chars")

        # 2. IMDb reviews
        reviews = fetch_imdb_reviews(imdb_id)
        print(f"    Reviews: {len(reviews)} chars")

        # 3. Genre intensities
        gi = movie.get("genre_intensities") or {}
        if not any(v != 0 for v in gi.values()):
            print("    Generating genre intensities...")
            gi = generate_genre_intensities(
                title,
                movie.get("tagline", ""),
                movie.get("keywords", ""),
                movie.get("summary", ""),
            )

        # 4. Build weighted embedding
        enriched_row = {**movie, "description": description, "reviews": reviews, "genre_intensities": gi}
        embedding_text = build_weighted_embedding_text(enriched_row)
        embedding = get_embedding(embedding_text)

        # 5. Update Supabase
        fields = {
            "description": description,
            "reviews": reviews,
            "genre_intensities": gi,
        }
        if update_movie(movie["id"], fields, embedding):
            enriched_count += 1
            print(f"    Done ({enriched_count}/{total})")
        else:
            print(f"    Failed to update Supabase")

        # Be polite to IMDb — avoid rate limiting
        time.sleep(1.5)

    print(f"\nEnrichment complete: {enriched_count}/{total} movies updated.")


if __name__ == "__main__":
    main()
