import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

    INSTAGRAM_USERNAME = os.getenv("INSTAGRAM_USERNAME", "")
    INSTAGRAM_PASSWORD = os.getenv("INSTAGRAM_PASSWORD", "")

    POSTS_PER_DAY = int(os.getenv("POSTS_PER_DAY", "2"))
    POSTING_HOURS = [int(h.strip()) for h in os.getenv("POSTING_HOURS", "6,18").split(",")]

    FONT_PATH = os.getenv("FONT_PATH", "")
    FONT_BOLD_PATH = os.getenv("FONT_BOLD_PATH", "")

    SITE_URL = "https://al-sudfeh.vercel.app"

    SECTION_COLORS = {
        "شعر": (245, 158, 11),
        "قصة": (59, 130, 246),
        "نثر": (16, 185, 129),
        "مقالات": (139, 92, 246),
        "تأملات": (244, 63, 94),
    }

    BG_COLOR = (45, 53, 97)
    TEXT_COLOR = (255, 255, 255)
    ACCENT_COLOR = (200, 170, 110)


config = Config()
