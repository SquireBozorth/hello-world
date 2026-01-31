"""Scrapers for various NYC event sources.

Each scraper function returns a list of dicts with a consistent schema:
    {
        "title": str,
        "date": str,           # human-readable date/time
        "venue": str,
        "price": str,          # e.g. "Free", "$10", "Pay what you wish"
        "price_value": float,  # numeric for filtering (0.0 for free)
        "category": str,       # music | comedy | theater | activity | art | other
        "url": str,
        "source": str,         # which site it came from
        "neighborhood": str,   # if available
    }
"""

import logging
import re
from datetime import datetime

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
}


def _parse_price(text: str) -> float:
    """Extract a numeric price from a string. Returns 0.0 for free events."""
    if not text:
        return 0.0
    lower = text.lower().strip()
    if "free" in lower or lower == "0" or "no cover" in lower:
        return 0.0
    match = re.search(r"\$?([\d]+(?:\.[\d]{1,2})?)", lower)
    if match:
        return float(match.group(1))
    return 0.0


def scrape_theskint() -> list[dict]:
    """Scrape The Skint (theskint.com) for cheap/free NYC events."""
    events = []
    try:
        resp = requests.get("https://theskint.com", headers=HEADERS, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")

        # The Skint publishes daily posts with event listings
        post = soup.select_one("div.entry-content")
        if not post:
            return events

        for p_tag in post.find_all("p"):
            text = p_tag.get_text(separator=" ", strip=True)
            if len(text) < 20:
                continue

            link = p_tag.find("a")
            url = link["href"] if link else ""

            # Try to detect category from keywords
            category = _categorize(text)
            events.append({
                "title": text[:120],
                "date": datetime.now().strftime("%Y-%m-%d"),
                "venue": "",
                "price": "Free/Cheap",
                "price_value": 0.0,
                "category": category,
                "url": url,
                "source": "The Skint",
                "neighborhood": "",
            })
    except requests.RequestException as e:
        logger.warning("Failed to scrape The Skint: %s", e)
    return events


def scrape_nyc_parks() -> list[dict]:
    """Scrape NYC Parks events page for free outdoor activities."""
    events = []
    try:
        url = "https://www.nycgovparks.org/events"
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")

        for item in soup.select(".event_listing, .searchResult, li.event-item"):
            title_el = item.select_one("h3 a, h2 a, .event-title a")
            if not title_el:
                continue
            title = title_el.get_text(strip=True)
            link = title_el.get("href", "")
            if link and not link.startswith("http"):
                link = "https://www.nycgovparks.org" + link

            date_el = item.select_one(".date, .event-date, time")
            date_str = date_el.get_text(strip=True) if date_el else ""

            location_el = item.select_one(".location, .event-location")
            location = location_el.get_text(strip=True) if location_el else ""

            events.append({
                "title": title,
                "date": date_str,
                "venue": location,
                "price": "Free",
                "price_value": 0.0,
                "category": "activity",
                "url": link,
                "source": "NYC Parks",
                "neighborhood": "",
            })
    except requests.RequestException as e:
        logger.warning("Failed to scrape NYC Parks: %s", e)
    return events


def scrape_eventbrite_free() -> list[dict]:
    """Scrape Eventbrite for free/cheap NYC events."""
    events = []
    try:
        url = (
            "https://www.eventbrite.com/d/ny--new-york/free--events/"
            "?page=1&sort=date"
        )
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")

        for card in soup.select(
            "[data-testid='event-card'], .search-event-card-wrapper, .eds-event-card"
        ):
            title_el = card.select_one(
                "h2, h3, [data-testid='event-card-title'], .eds-event-card__formatted-name--is-clamped"
            )
            if not title_el:
                continue
            title = title_el.get_text(strip=True)

            link_el = card.select_one("a[href]")
            link = link_el["href"] if link_el else ""

            date_el = card.select_one(
                "[data-testid='event-card-date'], .eds-event-card-content__sub-title"
            )
            date_str = date_el.get_text(strip=True) if date_el else ""

            price_el = card.select_one(
                "[data-testid='event-card-price'], .eds-event-card-content__sub"
            )
            price_text = price_el.get_text(strip=True) if price_el else "Free"

            events.append({
                "title": title,
                "date": date_str,
                "venue": "",
                "price": price_text,
                "price_value": _parse_price(price_text),
                "category": _categorize(title),
                "url": link,
                "source": "Eventbrite",
                "neighborhood": "",
            })
    except requests.RequestException as e:
        logger.warning("Failed to scrape Eventbrite: %s", e)
    return events


def scrape_ohmyrockness() -> list[dict]:
    """Scrape Oh My Rockness for NYC live music shows."""
    events = []
    try:
        url = "https://www.ohmyrockness.com/shows"
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")

        for show in soup.select(".show-listing, .show-item, .show"):
            title_el = show.select_one("h3, .show-name, .artist-name")
            if not title_el:
                continue
            title = title_el.get_text(strip=True)

            link_el = show.select_one("a[href]")
            link = link_el["href"] if link_el else ""
            if link and not link.startswith("http"):
                link = "https://www.ohmyrockness.com" + link

            venue_el = show.select_one(".venue-name, .show-venue")
            venue = venue_el.get_text(strip=True) if venue_el else ""

            price_el = show.select_one(".price, .show-price")
            price_text = price_el.get_text(strip=True) if price_el else ""

            events.append({
                "title": title,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "venue": venue,
                "price": price_text or "See listing",
                "price_value": _parse_price(price_text),
                "category": "music",
                "url": link,
                "source": "Oh My Rockness",
                "neighborhood": "",
            })
    except requests.RequestException as e:
        logger.warning("Failed to scrape Oh My Rockness: %s", e)
    return events


def _categorize(text: str) -> str:
    """Guess event category from text."""
    lower = text.lower()
    if any(w in lower for w in ["comedy", "stand-up", "standup", "improv", "open mic"]):
        return "comedy"
    if any(w in lower for w in ["music", "concert", "band", "dj", "jazz", "live music"]):
        return "music"
    if any(w in lower for w in ["theater", "theatre", "play", "musical", "broadway"]):
        return "theater"
    if any(w in lower for w in ["art", "gallery", "exhibit", "museum", "painting"]):
        return "art"
    if any(w in lower for w in ["film", "movie", "screening", "cinema"]):
        return "other"
    return "activity"


ALL_SCRAPERS = [
    ("The Skint", scrape_theskint),
    ("NYC Parks", scrape_nyc_parks),
    ("Eventbrite", scrape_eventbrite_free),
    ("Oh My Rockness", scrape_ohmyrockness),
]
