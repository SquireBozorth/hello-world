#!/usr/bin/env python3
"""NYC events aggregator runner.

Usage:
    python -m events.runner                     # Show all events under $25
    python -m events.runner --max-price 10      # Only events under $10
    python -m events.runner --categories music comedy
    python -m events.runner --email             # Email the digest to yourself
    python -m events.runner --save              # Save to output/events.txt
"""

import argparse
import logging

from .aggregator import gather_events, format_terminal, save_to_file, send_events_email

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="NYC cheap events aggregator")
    parser.add_argument(
        "--max-price",
        type=float,
        default=25.0,
        help="Maximum event price in dollars (default: 25)",
    )
    parser.add_argument(
        "--categories",
        nargs="+",
        choices=["music", "comedy", "theater", "art", "activity", "other"],
        help="Filter by event categories",
    )
    parser.add_argument(
        "--email",
        action="store_true",
        help="Email the events digest to yourself (requires GMAIL_APP_PASSWORD in .env)",
    )
    parser.add_argument(
        "--save",
        action="store_true",
        help="Save results to output/events.txt",
    )
    args = parser.parse_args()

    events = gather_events(max_price=args.max_price, categories=args.categories)
    print(format_terminal(events))

    if args.email:
        if send_events_email(events):
            logger.info("Events digest emailed successfully.")
        else:
            logger.error("Failed to email digest. Check GMAIL_APP_PASSWORD in .env")

    if args.save:
        save_to_file(events)


if __name__ == "__main__":
    main()
