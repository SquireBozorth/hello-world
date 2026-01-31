#!/usr/bin/env python3
"""Broadway lottery auto-entry runner.

Usage:
    python -m lottery.runner              # Open browser, fill forms, wait for CAPTCHA
    python -m lottery.runner --headless   # Fill forms without waiting (for cron/email-only)
"""

import argparse
import logging
from datetime import datetime

from .broadway_direct import run_all_entries

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
    for show, filled in results.items():
        if filled:
            color = "#2e7d32"
            status = "FORM FILLED — solve CAPTCHA to complete"
        else:
            color = "#888"
            status = "Lottery not open"
        rows += f'<tr><td style="padding:8px;border-bottom:1px solid #eee">{show}</td>'
        rows += f'<td style="padding:8px;border-bottom:1px solid #eee;color:{color}">{status}</td></tr>'

    open_count = sum(1 for v in results.values() if v)
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1a237e">🎭 Broadway Lottery Check</h2>
        <p style="color:#555">{now}</p>
        <table style="width:100%;border-collapse:collapse">
            <tr style="background:#f5f5f5">
                <th style="padding:8px;text-align:left">Show</th>
                <th style="padding:8px;text-align:left">Status</th>
            </tr>
            {rows}
        </table>
        <p style="color:#888;font-size:12px;margin-top:20px">
            {open_count} of {len(results)} shows had open lotteries.
            Check Broadway Direct for entry windows (usually open around 12am-9am).
        </p>
    </div>
    """
    plain = f"Broadway Lottery Check — {now}\n\n"
    for show, filled in results.items():
        status = "OPEN - form filled" if filled else "Not open"
        plain += f"  {show}: {status}\n"

    send_email(
        f"🎭 Lottery: {open_count} open — {datetime.now().strftime('%m/%d')}",
        html,
        plain,
    )


def main():
    parser = argparse.ArgumentParser(description="Broadway Direct lottery auto-fill")
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Don't wait for CAPTCHA interaction (just check & email results)",
    )
    args = parser.parse_args()

    interactive = not args.headless
    logger.info("Checking Broadway Direct lotteries...")
    results = run_all_entries(interactive=interactive)

    if results:
        for show, filled in results.items():
            status = "FILLED" if filled else "NOT OPEN"
            logger.info("  %s: %s", show, status)
        _send_lottery_email(results)
    else:
        logger.info("Could not check any lotteries (browser issue?).")


if __name__ == "__main__":
    main()
