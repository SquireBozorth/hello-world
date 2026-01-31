"""Events aggregator — pulls from all sources, filters, and formats output."""

import logging
import os
from datetime import datetime

from .sources import ALL_SCRAPERS

logger = logging.getLogger(__name__)


def gather_events(max_price: float = 25.0, categories: list[str] | None = None) -> list[dict]:
    """Run all scrapers and return filtered, deduplicated events."""
    all_events = []
    for name, scraper_fn in ALL_SCRAPERS:
        logger.info("Scraping %s...", name)
        try:
            events = scraper_fn()
            logger.info("  Found %d events from %s", len(events), name)
            all_events.extend(events)
        except Exception as e:
            logger.error("Scraper %s crashed: %s", name, e)

    # Filter by price
    filtered = [e for e in all_events if e["price_value"] <= max_price]

    # Filter by category if specified
    if categories:
        cats = {c.lower() for c in categories}
        filtered = [e for e in filtered if e["category"] in cats]

    # Deduplicate by title similarity (exact match for now)
    seen_titles = set()
    unique = []
    for e in filtered:
        key = e["title"].lower().strip()[:60]
        if key not in seen_titles:
            seen_titles.add(key)
            unique.append(e)

    return unique


def format_terminal(events: list[dict]) -> str:
    """Format events for terminal display."""
    if not events:
        return "No events found matching your criteria."

    lines = []
    lines.append(f"\n{'='*70}")
    lines.append(f"  NYC EVENTS — {datetime.now().strftime('%A, %B %d, %Y')}")
    lines.append(f"  Found {len(events)} events")
    lines.append(f"{'='*70}\n")

    # Group by category
    by_cat: dict[str, list[dict]] = {}
    for e in events:
        by_cat.setdefault(e["category"], []).append(e)

    category_labels = {
        "music": "Live Music",
        "comedy": "Comedy",
        "theater": "Theater & Plays",
        "art": "Art & Exhibits",
        "activity": "Activities & Other",
        "other": "Other",
    }

    for cat, cat_events in sorted(by_cat.items()):
        label = category_labels.get(cat, cat.title())
        lines.append(f"  --- {label} ({len(cat_events)}) ---\n")
        for e in cat_events:
            lines.append(f"  {e['title']}")
            details = []
            if e["date"]:
                details.append(e["date"])
            if e["venue"]:
                details.append(e["venue"])
            details.append(e["price"])
            lines.append(f"    {' | '.join(details)}")
            if e["url"]:
                lines.append(f"    {e['url']}")
            lines.append(f"    [via {e['source']}]")
            lines.append("")

    return "\n".join(lines)


def save_to_file(events: list[dict], path: str = "output/events.txt"):
    """Save formatted events to a text file."""
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    text = format_terminal(events)
    with open(path, "w") as f:
        f.write(text)
    logger.info("Events saved to %s", path)
