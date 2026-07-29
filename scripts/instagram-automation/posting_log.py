import json
import os
from datetime import datetime

LOG_FILE = "posting_log.json"


def load_posted_ids() -> set[str]:
    if not os.path.exists(LOG_FILE):
        return set()
    try:
        with open(LOG_FILE, encoding="utf-8") as f:
            data = json.load(f)
        return {entry["article_id"] for entry in data}
    except (json.JSONDecodeError, KeyError):
        return set()


def mark_posted(article_id: str, success: bool, details: str = ""):
    log = []
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, encoding="utf-8") as f:
                log = json.load(f)
        except json.JSONDecodeError:
            log = []

    log.append({
        "article_id": article_id,
        "timestamp": datetime.now().isoformat(),
        "success": success,
        "details": details,
    })

    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(log, f, ensure_ascii=False, indent=2)


def get_stats() -> dict:
    if not os.path.exists(LOG_FILE):
        return {"total": 0, "success": 0, "failed": 0}
    try:
        with open(LOG_FILE, encoding="utf-8") as f:
            log = json.load(f)
        total = len(log)
        success = sum(1 for e in log if e["success"])
        failed = total - success
        return {"total": total, "success": success, "failed": failed}
    except json.JSONDecodeError:
        return {"total": 0, "success": 0, "failed": 0}
