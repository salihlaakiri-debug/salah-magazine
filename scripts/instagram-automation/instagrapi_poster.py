import os
import logging
from instagrapi import Client
from instagrapi.exceptions import LoginRequired
from config import config

logger = logging.getLogger(__name__)

_client: Client | None = None
_SESSION_FILE = "instagram_session.json"


def _login() -> Client:
    global _client
    cl = Client()
    cl.delay_range = [5, 12]
    cl.request_timeout = 30

    if os.path.exists(_SESSION_FILE):
        try:
            cl.load_settings(_SESSION_FILE)
            cl.login(config.INSTAGRAM_USERNAME, config.INSTAGRAM_PASSWORD)
            logger.info("Logged in via saved session")
            _client = cl
            return cl
        except Exception as e:
            logger.warning(f"Session login failed: {e}")

    try:
        cl.login(config.INSTAGRAM_USERNAME, config.INSTAGRAM_PASSWORD)
        cl.dump_settings(_SESSION_FILE)
        logger.info("Fresh login successful")
        _client = cl
        return cl
    except Exception as e:
        logger.error(f"Instagram login failed: {e}")
        raise


def get_client() -> Client:
    global _client
    if _client is None:
        _client = _login()
    try:
        _client.get_timeline_feed()
    except LoginRequired:
        logger.info("Session expired, re-logging in")
        _client = _login()
    return _client


def post_to_instagram(image_path: str, caption: str) -> bool:
    try:
        cl = get_client()
        caption = caption[:2200]
        cl.photo_upload(image_path, caption)
        logger.info("Posted to Instagram successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to post to Instagram: {e}")
        return False
