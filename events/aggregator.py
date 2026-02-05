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


def format_html(events: list[dict]) -> str:
    """Format events as a nice HTML email."""
    if not events:
        return "<p>No events found matching your criteria.</p>"

    today = datetime.now().strftime("%A, %B %d, %Y")
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
    category_emoji = {
        "music": "🎵",
        "comedy": "😂",
        "theater": "🎭",
        "art": "🎨",
        "activity": "🎯",
        "other": "📌",
    }

    sections = ""
    for cat, cat_events in sorted(by_cat.items()):
        label = category_labels.get(cat, cat.title())
        emoji = category_emoji.get(cat, "📌")
        cards = ""
        for e in cat_events:
            details = []
            if e["date"]:
                details.append(e["date"])
            if e["venue"]:
                details.append(e["venue"])
            details.append(e["price"])
            detail_str = " &middot; ".join(details)
            link = f'<a href="{e["url"]}" style="color:#1565c0;text-decoration:none">Details →</a>' if e["url"] else ""
            cards += f"""
            <div style="padding:12px 0;border-bottom:1px solid #eee">
                <div style="font-weight:bold;font-size:15px">{e['title']}</div>
                <div style="color:#666;font-size:13px;margin-top:4px">{detail_str}</div>
                <div style="margin-top:4px;font-size:12px">{link} <span style="color:#aaa">via {e['source']}</span></div>
            </div>"""
        sections += f"""
        <div style="margin-bottom:24px">
            <h3 style="color:#1a237e;border-bottom:2px solid #e8eaf6;padding-bottom:6px">{emoji} {label} ({len(cat_events)})</h3>
            {cards}
        </div>"""

    return f"""
    <div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;padding:20px">
        <h2 style="color:#1a237e">NYC Events — Next 2 Weeks</h2>
        <p style="color:#555">{today} &middot; {len(events)} events under your price cap</p>
        {sections}
        <p style="color:#aaa;font-size:11px;margin-top:30px">Generated automatically. Sources: The Skint, NYC Parks, Eventbrite, Oh My Rockness</p>
    </div>
    """


def send_events_email(events: list[dict]) -> bool:
    """Email the events digest to yourself."""
    try:
        from shared_email import send_email
    except ImportError:
        logger.warning("shared_email module not found; can't send email.")
        return False

    html = format_html(events)
    plain = format_terminal(events)
    subject = f"NYC Events Digest — {len(events)} events — {datetime.now().strftime('%m/%d')}"
    return send_email(subject, html, plain)


def save_to_file(events: list[dict], path: str = "output/events.txt"):
    """Save formatted events to a text file."""
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    text = format_terminal(events)
    with open(path, "w") as f:
        f.write(text)
    logger.info("Events saved to %s", path)
