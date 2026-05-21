"""
AnimeX Scraper — https://animex.wrdd.site/
Scrapes anime data from the site's internal REST API.

Usage:
    python animex_scraper.py                          # Scrape all sections to animex_data.json
    python animex_scraper.py --section recent         # recent | browse | home | schedule | genres
    python animex_scraper.py --pages 5                # How many pages to scrape (browse/recent)
    python animex_scraper.py --query "naruto"         # Search by title
    python animex_scraper.py --genre Action           # Filter by genre
    python animex_scraper.py --type TV                # Filter by type (TV, Movie, OVA, ONA, Special)
    python animex_scraper.py --anime-id 16498         # Scrape single anime detail + episodes by ID
    python animex_scraper.py --output out.json        # Output file (default: animex_data.json)

    # iframe scraping (video sources per episode)
    python animex_scraper.py --iframes --anime-id 16498            # All episodes, all langs
    python animex_scraper.py --iframes --anime-id 16498 --lang sub # Sub only
    python animex_scraper.py --iframes --anime-id 16498 --episode 1  # Single episode
    python animex_scraper.py --iframes --anime-id 16498 --delay 1.0   # Custom delay (seconds)
"""

import argparse
import json
import time
import sys
from pathlib import Path
import urllib.request
import urllib.parse
import urllib.error

BASE_URL = "https://animex.wrdd.site"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://animex.wrdd.site/",
    "X-Requested-With": "XMLHttpRequest",
}


# ---------------------------------------------------------------------------
# HTTP helper
# ---------------------------------------------------------------------------

def get(path: str, params: dict = None) -> dict | list:
    """Make a GET request to the API and return parsed JSON."""
    url = BASE_URL + path
    if params:
        # Remove None values
        clean = {k: v for k, v in params.items() if v is not None}
        if clean:
            url += "?" + urllib.parse.urlencode(clean)

    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw)
    except urllib.error.HTTPError as e:
        print(f"  [HTTP {e.code}] {url}", file=sys.stderr)
        return {}
    except Exception as e:
        print(f"  [ERROR] {url} — {e}", file=sys.stderr)
        return {}


# ---------------------------------------------------------------------------
# Scraping functions
# ---------------------------------------------------------------------------

def scrape_home() -> dict:
    """Scrape the home page sections: spotlight, trending, popular, seasonal, upcoming, recent."""
    print("Scraping home …")
    data = get("/api/anime")
    result = {}
    for section, items in data.items():
        result[section] = items
        print(f"  {section}: {len(items) if isinstance(items, list) else '?'} items")
    return result


def scrape_recent(max_pages: int = 1) -> list:
    """Scrape recently updated anime across multiple pages."""
    print(f"Scraping recent (up to {max_pages} page(s)) …")
    all_items = []
    for page in range(1, max_pages + 1):
        data = get("/api/anime/recent", {"page": page})
        items = data.get("data", [])
        pagination = data.get("pagination", {})
        all_items.extend(items)
        print(f"  Page {page}: {len(items)} items (total so far: {len(all_items)})")
        if not items or page >= pagination.get("last_page", page):
            break
        time.sleep(0.5)
    return all_items


def scrape_browse(
    max_pages: int = 1,
    query: str = None,
    genre: str = None,
    anime_type: str = None,
) -> list:
    """Browse/search anime with optional filters."""
    label_parts = []
    if query:
        label_parts.append(f'q="{query}"')
    if genre:
        label_parts.append(f"genre={genre}")
    if anime_type:
        label_parts.append(f"type={anime_type}")
    label = ", ".join(label_parts) if label_parts else "all"
    print(f"Scraping browse [{label}] (up to {max_pages} page(s)) …")

    all_items = []
    for page in range(1, max_pages + 1):
        data = get("/api/anime/browse", {
            "page": page,
            "q": query,
            "genre": genre,
            "type": anime_type,
        })
        items = data.get("data", [])
        pagination = data.get("pagination", {})
        all_items.extend(items)
        print(f"  Page {page}: {len(items)} items (total so far: {len(all_items)})")
        if not items or page >= pagination.get("last_page", page):
            break
        time.sleep(0.5)
    return all_items


def scrape_genres() -> list:
    """Return the list of available genres."""
    print("Scraping genres …")
    data = get("/api/anime/genres")
    genres = data if isinstance(data, list) else list(data.values())
    print(f"  {len(genres)} genres found")
    return genres


def scrape_schedule(date: str = None) -> list:
    """Scrape the airing schedule. date format: YYYY-MM-DD."""
    params = {"date": date} if date else {}
    label = date or "today"
    print(f"Scraping schedule [{label}] …")
    data = get("/api/anime/schedule", params)
    items = data.get("scheduledAnimes", [])
    print(f"  {len(items)} scheduled anime")
    return items


def scrape_anime_detail(anime_id: str) -> dict:
    """Scrape full detail + episode list for a single anime."""
    print(f"Scraping anime detail [id={anime_id}] …")
    detail = get(f"/api/anime/{anime_id}")
    episodes = get(f"/api/anime/{anime_id}/episodes")
    result = {**detail, "scraped_episodes": episodes}
    ep_count = len(episodes) if isinstance(episodes, list) else "?"
    title = detail.get("title", anime_id)
    print(f"  Title: {title} | Episodes fetched: {ep_count}")
    return result


def scrape_episode_iframes(anime_id: str, episode: int | str, lang: str = None) -> dict:
    """
    Fetch iframe sources for a single episode.
    Returns a dict with episode info, sources (iframes), subtitles, intro/outro timestamps.
    """
    params = {}
    if lang:
        params["lang"] = lang
    data = get(f"/api/anime/{anime_id}/episodes/{episode}", params or None)
    return data


def scrape_all_iframes(
    anime_id: str,
    lang: str = None,
    episode: int | str = None,
    delay: float = 0.8,
) -> dict:
    """
    Scrape iframe sources for every episode of an anime (or a single episode).

    Returns:
        {
          "anime_id": "16498",
          "title": "Attack on Titan",
          "episodes": [
            {
              "number": 1,
              "title": "Episode 1",
              "sources": [
                {"url": "https://kwik.cx/e/...", "quality": "1080p", "lang": "sub", ...},
                ...
              ],
              "subtitles": [...],
              "intro": {...},
              "outro": {...}
            },
            ...
          ]
        }
    """
    # Fetch the episode list first to know how many episodes exist
    print(f"Fetching episode list for anime {anime_id} …")
    ep_list = get(f"/api/anime/{anime_id}/episodes")
    if not ep_list:
        print("  No episode list returned — trying episodes/all endpoint …")
        ep_list = get(f"/api/anime/{anime_id}/episodes/all")

    # Normalise to a list of episode numbers
    if isinstance(ep_list, list):
        ep_numbers = [e.get("number", e.get("episode_number", i + 1)) for i, e in enumerate(ep_list)]
    elif isinstance(ep_list, dict):
        # Sometimes the API returns {"episodes": [...]}
        inner = ep_list.get("episodes") or ep_list.get("data") or []
        ep_numbers = [e.get("number", e.get("episode_number", i + 1)) for i, e in enumerate(inner)]
    else:
        ep_numbers = []

    # Single-episode mode
    if episode is not None:
        ep_numbers = [int(episode)]

    if not ep_numbers:
        print("  Could not determine episode numbers — aborting iframe scrape.")
        return {}

    lang_label = lang or "all"
    print(f"  Scraping iframes for {len(ep_numbers)} episode(s) [lang={lang_label}] …")

    # Fetch the anime title for context (handle nested structures)
    detail = get(f"/api/anime/{anime_id}")
    if isinstance(detail, dict):
        title = (detail.get("title")
                 or detail.get("anime", {}).get("title")
                 or detail.get("data", {}).get("title")
                 or anime_id)
    else:
        title = anime_id

    results = []
    resolved_title = title  # may be overridden from first episode response
    for ep_num in ep_numbers:
        data = scrape_episode_iframes(anime_id, ep_num, lang=lang)
        ep_info = data.get("episode", {})
        sources = data.get("sources", [])
        # Use anime title from episode response as fallback
        if resolved_title == anime_id:
            resolved_title = data.get("anime", {}).get("title", anime_id)
        # Filter by lang if requested (API sometimes returns all regardless)
        if lang:
            sources = [s for s in sources if s.get("lang", "").lower() == lang.lower()]
        results.append({
            "number": ep_info.get("number", ep_num),
            "title": ep_info.get("title", f"Episode {ep_num}"),
            "sources": sources,
            "subtitles": data.get("subtitles", []),
            "intro": data.get("intro"),
            "outro": data.get("outro"),
        })
        src_count = len(sources)
        print(f"  Ep {ep_num}: {src_count} source(s) — {[s['quality'] + '/' + s['lang'] for s in sources]}")
        if ep_num != ep_numbers[-1]:
            time.sleep(delay)

    return {
        "anime_id": anime_id,
        "title": resolved_title,
        "lang_filter": lang,
        "episodes": results,
    }


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args():
    parser = argparse.ArgumentParser(
        description="Scrape anime data from animex.wrdd.site",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--section", choices=["home", "recent", "browse", "schedule", "genres", "all"],
                        default="all", help="Which section to scrape (default: all)")
    parser.add_argument("--pages", type=int, default=1,
                        help="Max pages for recent/browse (default: 1)")
    parser.add_argument("--query", default=None,
                        help="Search query for browse")
    parser.add_argument("--genre", default=None,
                        help="Genre filter, e.g. Action, Romance")
    parser.add_argument("--type", dest="anime_type", default=None,
                        help="Type filter: TV, Movie, OVA, ONA, Special")
    parser.add_argument("--anime-id", default=None,
                        help="Anime ID (e.g. 16498) — required for --iframes")
    parser.add_argument("--date", default=None,
                        help="Schedule date YYYY-MM-DD (default: today)")
    parser.add_argument("--output", default="animex_data.json",
                        help="Output JSON file (default: animex_data.json)")
    # iframe-specific flags
    parser.add_argument("--iframes", action="store_true",
                        help="Scrape iframe video sources for all episodes of --anime-id")
    parser.add_argument("--lang", default=None, choices=["sub", "dub"],
                        help="Language filter for iframes: sub | dub (default: both)")
    parser.add_argument("--episode", default=None,
                        help="Scrape iframes for a single episode number only")
    parser.add_argument("--delay", type=float, default=0.8,
                        help="Seconds to wait between episode requests (default: 0.8)")
    return parser.parse_args()


def main():
    args = parse_args()
    result = {}

    if args.iframes:
        if not args.anime_id:
            print("Error: --iframes requires --anime-id", file=sys.stderr)
            sys.exit(1)
        result = scrape_all_iframes(
            anime_id=args.anime_id,
            lang=args.lang,
            episode=args.episode,
            delay=args.delay,
        )
    elif args.anime_id:
        result = scrape_anime_detail(args.anime_id)
    elif args.section == "all":
        result["home"] = scrape_home()
        result["recent"] = scrape_recent(max_pages=args.pages)
        result["browse"] = scrape_browse(
            max_pages=args.pages,
            query=args.query,
            genre=args.genre,
            anime_type=args.anime_type,
        )
        result["genres"] = scrape_genres()
        result["schedule"] = scrape_schedule(date=args.date)
    elif args.section == "home":
        result = scrape_home()
    elif args.section == "recent":
        result = scrape_recent(max_pages=args.pages)
    elif args.section == "browse":
        result = scrape_browse(
            max_pages=args.pages,
            query=args.query,
            genre=args.genre,
            anime_type=args.anime_type,
        )
    elif args.section == "genres":
        result = scrape_genres()
    elif args.section == "schedule":
        result = scrape_schedule(date=args.date)

    out_path = Path(args.output)
    out_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nSaved -> {out_path.resolve()}")


if __name__ == "__main__":
    main()
