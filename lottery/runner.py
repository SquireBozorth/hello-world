#!/usr/bin/env python3
"""Broadway lottery auto-entry runner.

Usage:
    python -m lottery.runner          # Run once (enter all open lotteries now)
    python -m lottery.runner --loop   # Run on a schedule (checks every 30 min)
"""

import argparse
import logging
import time
from datetime import datetime

import schedule

from .config import SHOWS
from .todaytix import run_all_entries

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def _send_lottery_email(results: dict):
    """Send an email summary of lottery entries."""
    try:
        from shared_email import send_email
    except ImportError:
        return

    now = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    rows = ""
    for show, ok in results.items():
        color = "#2e7d32" if ok else "#c62828"
        status = "ENTERED" if ok else "FAILED"
        rows += f'<tr><td style="padding:8px;border-bottom:1px solid #eee">{show}</td>'
        rows += f'<td style="padding:8px;border-bottom:1px solid #eee;color:{color};font-weight:bold">{status}</td></tr>'

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1a237e">🎭 Broadway Lottery Results</h2>
        <p style="color:#555">{now}</p>
        <table style="width:100%;border-collapse:collapse">
            <tr style="background:#f5f5f5">
                <th style="padding:8px;text-align:left">Show</th>
                <th style="padding:8px;text-align:left">Status</th>
            </tr>
            {rows}
        </table>
        <p style="color:#888;font-size:12px;margin-top:20px">
            Entered {sum(1 for v in results.values() if v)} of {len(results)} available lotteries.
            Winners are typically notified by email/text a few hours before showtime.
        </p>
    </div>
    """
    plain = f"Broadway Lottery Results — {now}\n\n"
    for show, ok in results.items():
        plain += f"  {show}: {'ENTERED' if ok else 'FAILED'}\n"

    send_email(f"🎭 Lottery: Entered {sum(1 for v in results.values() if v)} shows — {datetime.now().strftime('%m/%d')}", html, plain)


def run_once():
    logger.info("Checking all configured shows for open lotteries...")
    results = run_all_entries(SHOWS)
    if results:
        logger.info("Entry results:")
        for show, ok in results.items():
            status = "ENTERED" if ok else "FAILED"
            logger.info("  %s: %s", show, status)
        _send_lottery_email(results)
    else:
        logger.info("No open lotteries found at this time.")


def main():
    parser = argparse.ArgumentParser(description="Broadway lottery auto-entry")
    parser.add_argument(
        "--loop",
        action="store_true",
        help="Run continuously on a schedule (every 30 minutes)",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=30,
        help="Check interval in minutes when using --loop (default: 30)",
    )
    args = parser.parse_args()

    if args.loop:
        logger.info(
            "Starting lottery scheduler — checking every %d minutes.", args.interval
        )
        run_once()  # immediate first run
        schedule.every(args.interval).minutes.do(run_once)
        while True:
            schedule.run_pending()
            time.sleep(60)
    else:
        run_once()


if __name__ == "__main__":
    main()
