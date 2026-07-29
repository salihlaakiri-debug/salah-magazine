#!/usr/bin/env python3
"""
Al-Sudfeh Magazine — Instagram Automation System
مجلة السُّدفة — نظام الإدارة التلقائية لحساب إنستغرام

Usage:
    python main.py            Run one post cycle (default, for GitHub Actions)
    python main.py --once     Same as above
    python main.py --daemon   Run continuously with scheduler
    python main.py --stats    Show posting stats
"""

import sys
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("main")


def main():
    args = sys.argv[1:]

    if "--stats" in args:
        from posting_log import get_stats
        stats = get_stats()
        print(f"Total posts attempted: {stats['total']}")
        print(f"Successful: {stats['success']}")
        print(f"Failed: {stats['failed']}")
        return

    if "--daemon" in args:
        from scheduler import run_continuously
        try:
            run_continuously()
        except KeyboardInterrupt:
            logger.info("Shutting down...")
        return

    from scheduler import run_once
    result = run_once()
    if result.get("status") == "error":
        sys.exit(1)


if __name__ == "__main__":
    main()
