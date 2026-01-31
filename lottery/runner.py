#!/usr/bin/env python3
"""Broadway lottery auto-entry runner.

Usage:
    python -m lottery.runner          # Run once (enter all open lotteries now)
    python -m lottery.runner --loop   # Run on a schedule (checks every 30 min)
"""

import argparse
import logging
import time

import schedule

from .config import SHOWS
from .todaytix import run_all_entries

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def run_once():
    logger.info("Checking all configured shows for open lotteries...")
    results = run_all_entries(SHOWS)
    if results:
        logger.info("Entry results:")
        for show, ok in results.items():
            status = "ENTERED" if ok else "FAILED"
            logger.info("  %s: %s", show, status)
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
