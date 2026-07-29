from supabase import create_client, Client
from config import config


supabase: Client | None = None


def get_supabase() -> Client:
    global supabase
    if supabase is None:
        supabase = create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY)
    return supabase


def fetch_unposted_articles(posted_ids: set[str], limit: int = 10):
    client = get_supabase()
    result = (
        client.table("articles")
        .select("id, title, content, excerpt, section, author_name, read_time, published_at")
        .eq("status", "published")
        .order("published_at", desc=True)
        .limit(50)
        .execute()
    )
    articles = []
    for row in result.data or []:
        if row["id"] not in posted_ids and row.get("content"):
            articles.append(row)
        if len(articles) >= limit:
            break
    return articles


def fetch_article_by_id(article_id: str):
    client = get_supabase()
    result = (
        client.table("articles")
        .select("id, title, content, excerpt, section, author_name, read_time, published_at")
        .eq("id", article_id)
        .single()
        .execute()
    )
    return result.data if result.data else None


def get_total_article_count():
    client = get_supabase()
    result = (
        client.table("articles")
        .select("id", count="exact")
        .eq("status", "published")
        .execute()
    )
    return result.count or 0
