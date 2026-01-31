"""TodayTix lottery entry module.

TodayTix runs the digital lottery for many Broadway shows. This module
uses their public API to check which lotteries are currently open and
submit entries automatically.
"""

import requests
import logging
from datetime import datetime

from .config import TODAYTIX_API_BASE, TODAYTIX_LOTTERY_ENTRY_URL, USER_INFO

logger = logging.getLogger(__name__)

SESSION = requests.Session()
SESSION.headers.update({
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
})


def get_active_lotteries(show_id: str) -> list[dict]:
    """Fetch currently open lottery entries for a given TodayTix show ID."""
    url = f"{TODAYTIX_API_BASE}/shows/{show_id}/lotteries"
    try:
        resp = SESSION.get(url, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        lotteries = data.get("data", [])
        active = [
            lot for lot in lotteries
            if lot.get("isActive") or lot.get("status") == "ACTIVE"
        ]
        return active
    except requests.RequestException as e:
        logger.warning("Failed to fetch lotteries for show %s: %s", show_id, e)
        return []


def enter_lottery(lottery_id: str, show_name: str) -> bool:
    """Submit a lottery entry for the given lottery ID.

    Returns True if the entry was submitted successfully, False otherwise.
    """
    if not all([USER_INFO["first_name"], USER_INFO["email"]]):
        logger.error("Missing required user info. Check your .env file.")
        return False

    payload = {
        "lottery_id": lottery_id,
        "first_name": USER_INFO["first_name"],
        "last_name": USER_INFO["last_name"],
        "email": USER_INFO["email"],
        "phone_number": USER_INFO["phone"],
        "date_of_birth": USER_INFO["date_of_birth"],
        "zip_code": USER_INFO["zip_code"],
        "number_of_tickets": USER_INFO["num_tickets"],
    }

    try:
        resp = SESSION.post(TODAYTIX_LOTTERY_ENTRY_URL, json=payload, timeout=15)
        if resp.status_code in (200, 201):
            logger.info(
                "[%s] Successfully entered lottery for %s (lottery %s)",
                datetime.now().strftime("%Y-%m-%d %H:%M"),
                show_name,
                lottery_id,
            )
            return True
        else:
            logger.warning(
                "[%s] Entry failed for %s — HTTP %d: %s",
                datetime.now().strftime("%Y-%m-%d %H:%M"),
                show_name,
                resp.status_code,
                resp.text[:200],
            )
            return False
    except requests.RequestException as e:
        logger.error("Request error entering lottery for %s: %s", show_name, e)
        return False


def run_all_entries(shows: dict) -> dict:
    """Check every configured show for open lotteries and enter them all.

    Returns a dict of {show_name: success_bool} for shows that had open lotteries.
    """
    results = {}
    for show_name, info in shows.items():
        if info["platform"] != "todaytix":
            continue
        lotteries = get_active_lotteries(info["show_id"])
        if not lotteries:
            logger.info("No active lottery for %s right now.", show_name)
            continue
        for lot in lotteries:
            lottery_id = str(lot.get("id", ""))
            if lottery_id:
                success = enter_lottery(lottery_id, show_name)
                results[show_name] = success
    return results
