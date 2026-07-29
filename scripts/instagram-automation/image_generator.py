import os
import logging
from PIL import Image, ImageDraw, ImageFont
from config import config

logger = logging.getLogger(__name__)

_FONT_CANDIDATES = [
    "fonts/Amiri-Regular.ttf",
    "fonts/Amiri-Bold.ttf",
    "/usr/share/fonts/truetype/noto/NotoNaskhArabic-Regular.ttf",
    "/usr/share/fonts/truetype/noto/NotoNaskhArabic-Bold.ttf",
    "/usr/share/fonts/opentype/noto/NotoNaskhArabic-Regular.ttf",
    "C:/Windows/Fonts/arial.ttf",
    "C:/Windows/Fonts/times.ttf",
]

_FONT_BOLD_CANDIDATES = [
    "fonts/Amiri-Bold.ttf",
    "/usr/share/fonts/truetype/noto/NotoNaskhArabic-Bold.ttf",
    "/usr/share/fonts/opentype/noto/NotoNaskhArabic-Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
    "C:/Windows/Fonts/timesbd.ttf",
]


def _find_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = _FONT_BOLD_CANDIDATES if bold else _FONT_CANDIDATES
    env_var = config.FONT_BOLD_PATH if bold else config.FONT_PATH
    if env_var and os.path.exists(env_var):
        return ImageFont.truetype(env_var, size)
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    logger.warning("No suitable font found, using default")
    return ImageFont.load_default()


def _wrap_text(text: str, font, max_width: int, draw: ImageDraw) -> list[str]:
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        w = bbox[2] - bbox[0]
        if w <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines or [text]


def generate_post_image(content: dict, output_path: str = "post.png"):
    width, height = 1080, 1080
    img = Image.new("RGB", (width, height), config.BG_COLOR)
    draw = ImageDraw.Draw(img)

    section_color = config.SECTION_COLORS.get(content["section"], config.ACCENT_COLOR)

    draw.rectangle([0, 0, width, 8], fill=section_color)

    font_quote = _find_font(52)
    font_section = _find_font(24)
    font_footer = _find_font(22)
    font_author = _find_font(18)

    section_label = f"  {content['section']}  "
    section_bbox = draw.textbbox((0, 0), section_label, font=font_section)
    section_w = section_bbox[2] - section_bbox[0]
    section_h = section_bbox[3] - section_bbox[1]
    section_x = (width - section_w) // 2
    section_y = 60
    draw.rounded_rectangle(
        [section_x - 20, section_y - 10, section_x + section_w + 20, section_y + section_h + 10],
        radius=20,
        fill=section_color + (80,),
    )
    draw.text((section_x, section_y), section_label, fill=section_color, font=font_section)

    quote = content["quote"]
    max_text_width = width - 160
    lines = _wrap_text(quote, font_quote, max_text_width, draw)

    line_height = 70
    total_text_height = len(lines) * line_height
    start_y = (height - total_text_height) // 2 - 40

    for i, line in enumerate(lines):
        line_bbox = draw.textbbox((0, 0), line, font=font_quote)
        line_w = line_bbox[2] - line_bbox[0]
        x = (width - line_w) // 2
        draw.text((x, start_y + i * line_height), line, fill=config.TEXT_COLOR, font=font_quote)

    deco_y = start_y + len(lines) * line_height + 20
    deco_text = " •  •  • "
    deco_bbox = draw.textbbox((0, 0), deco_text, font=font_footer)
    deco_w = deco_bbox[2] - deco_bbox[0]
    draw.text(((width - deco_w) // 2, deco_y), deco_text, fill=config.ACCENT_COLOR, font=font_footer)

    footer_y = height - 120

    bar_width = 60
    bar_height = 3
    bar_x = (width - bar_width) // 2
    draw.rectangle([bar_x, footer_y, bar_x + bar_width, footer_y + bar_height], fill=config.ACCENT_COLOR)

    name_text = "السُّدفة"
    name_bbox = draw.textbbox((0, 0), name_text, font=font_footer)
    name_w = name_bbox[2] - name_bbox[0]
    draw.text(((width - name_w) // 2, footer_y + 20), name_text, fill=config.ACCENT_COLOR, font=font_footer)

    site_text = "al-sudfeh.vercel.app"
    site_bbox = draw.textbbox((0, 0), site_text, font=font_author)
    site_w = site_bbox[2] - site_bbox[0]
    draw.text(((width - site_w) // 2, footer_y + 50), site_text, fill=(150, 150, 150), font=font_author)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, quality=95)
    logger.info(f"Image saved: {output_path} ({os.path.getsize(output_path)} bytes)")
    return output_path
