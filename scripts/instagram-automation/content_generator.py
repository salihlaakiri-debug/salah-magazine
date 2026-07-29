import json
import logging
from openai import OpenAI
from config import config

logger = logging.getLogger(__name__)

try:
    client = OpenAI(api_key=config.OPENAI_API_KEY)
    _openai_available = bool(config.OPENAI_API_KEY) and config.OPENAI_API_KEY != "sk-placeholder-openai-key-here"
except Exception:
    client = None
    _openai_available = False


def _fallback_content(article: dict) -> dict:
    title = article["title"]
    excerpt = article.get("excerpt", "")
    section = article.get("section", "أدب")
    author = article.get("author_name", "السُّدفة")
    return {
        "quote": excerpt or f"اقتباس من مقال: {title}",
        "caption": f"اقرأ مقال \"{title}\" في مجلة السُّدفة. {section} أدبي يأخذك إلى عوالم من التأمل والجمال.",
        "hashtags": ["#أدب", "#السدفة", "#اقتباسات", "#قراءة", "#كتابة", "#أدب_عربي", "#ثقافة", "#تأملات"],
        "topic_title": title,
        "call_to_action": "شاركونا رأيكم في التعليقات",
        "article_title": title,
        "section": section,
        "author": author,
    }


def generate_post_content(article: dict) -> dict:
    if not _openai_available:
        logger.warning("OpenAI not configured, using fallback content")
        return _fallback_content(article)

    title = article["title"]
    excerpt = article.get("excerpt", "")
    content = article.get("content", "")
    section = article.get("section", "أدب")
    author = article.get("author_name", "السُّدفة")

    text_for_ai = f"العنوان: {title}\nالمقتطف: {excerpt}\nالمحتوى: {content[:2000]}"

    prompt = f"""أنت مدير حسابات إنستغرام لمجلة أدبية عربية اسمها "السُّدفة".
المقال التالي من قسم {section}:

{text_for_ai}

المهمة: أنشئ منشوراً أدبياً جذاباً لإنستغرام بالعربية. أعد JSON بالحقول التالية:
- "quote": اقتباس مؤثر من المقال (جملة أو جملتين قصيرتين)
- "caption": نص المنشور (40-80 كلمة، أدبي وجذاب، يشجع على القراءة)
- "hashtags": مصفوفة من 10-15 هاشتاغ (#أدب #شعر #اقتباسات ...)
- "topic_title": عنوان للموضوع (جملة قصيرة)
- "call_to_action": دعوة للتفاعل (مثل "ما رأيك؟ شاركنا في التعليقات")"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "أنت كاتب أدبي ومحرر محتوى. رد فقط بـ JSON صالح."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
            response_format={"type": "json_object"},
        )

        result = json.loads(response.choices[0].message.content)
        return {
            "quote": result.get("quote", excerpt or "اقتباس من المقال"),
            "caption": result.get("caption", ""),
            "hashtags": result.get("hashtags", []),
            "topic_title": result.get("topic_title", title),
            "call_to_action": result.get("call_to_action", "شاركونا رأيكم في التعليقات"),
            "article_title": title,
            "section": section,
            "author": author,
        }
    except Exception as e:
        logger.error(f"OpenAI generation failed: {e}, using fallback")
        return _fallback_content(article)
