import os
import logging
from datetime import datetime

from config import config
from supabase_client import fetch_unposted_articles
from content_generator import generate_post_content
from image_generator import generate_post_image
from instagram_poster import post_to_instagram
from posting_log import load_posted_ids, mark_posted, get_stats

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("scheduler")

IMAGES_DIR = "generated_images"


def build_caption(content: dict) -> str:
    hashtags = content.get("hashtags", [])
    if isinstance(hashtags, list):
        hashtag_str = " ".join(hashtags)
    else:
        hashtag_str = "#أدب #السدفة #اقتباسات"

    caption = (
        f"\u200F{content['topic_title']}\n\n"
        f"\u201C{content['quote']}\u201D\n\n"
        f"{content['caption']}\n\n"
        f"\u2014 {content['author']}\n"
        f"\u25B8 {content['section']}\n\n"
        f"{content.get('call_to_action', '')}\n\n"
        f"\U0001F517 al-sudfeh.vercel.app\n\n"
        f"{hashtag_str}"
    )
    return caption


def run_once():
    logger.info("Starting post cycle")
    posted_ids = load_posted_ids()
    stats = get_stats()
    logger.info(f"Stats so far: {stats}")

    articles = fetch_unposted_articles(posted_ids, limit=3)
    if not articles:
        logger.info("No unposted articles found")
        return {"status": "skipped", "reason": "no_articles"}

    article = articles[0]
    article_id = article["id"]
    title = article["title"]
    logger.info(f"Processing: {title} ({article_id})")

    try:
        content = generate_post_content(article)
        logger.info(f"Content ready: {content['topic_title']}")

        os.makedirs(IMAGES_DIR, exist_ok=True)
        image_path = os.path.join(IMAGES_DIR, f"{article_id}.png")
        generate_post_image(content, output_path=image_path)

        caption = build_caption(content)

        if config.INSTAGRAM_USERNAME and config.INSTAGRAM_USERNAME != "placeholder":
            success = post_to_instagram(image_path, caption)
            mark_posted(article_id, success, f"Posted: {title}")
            if success:
                logger.info(f"Posted successfully: {title}")
            else:
                logger.error(f"Post failed: {title}")
        else:
            logger.info("Instagram credentials not set. Simulating post.")
            logger.info(f"Would post:\n{caption[:200]}...")
            mark_posted(article_id, True, f"Simulated: {title} (no creds)")

        return {"status": "ok", "article": title}

    except Exception as e:
        logger.exception(f"Error processing {title}: {e}")
        mark_posted(article_id, False, str(e))
        return {"status": "error", "article": title, "error": str(e)}
