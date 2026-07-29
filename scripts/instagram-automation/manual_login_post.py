"""
Opens browser, user logs in manually, script waits and auto-posts.
"""
import os
import json
import time
import logging
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.edge.options import Options
from selenium.webdriver.edge.service import Service
from webdriver_manager.microsoft import EdgeChromiumDriverManager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("manual")

IMAGE_PATH = r"generated_images\8b80e1f5-1a02-4301-b3cf-b7987a30d446.png"
CAPTION = "مطر من ورق\n\n#شعر #أدب #السدفة"

opts = Options()
opts.add_argument("--window-size=900,800")
opts.add_argument("--lang=ar")
opts.add_argument("--disable-blink-features=AutomationControlled")
opts.add_experimental_option("excludeSwitches", ["enable-automation"])
opts.add_experimental_option("useAutomationExtension", False)
service = Service(EdgeChromiumDriverManager().install())
driver = webdriver.Edge(service=service, options=opts)
driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

driver.get("https://www.instagram.com/")

print("LOGIN IN THE BROWSER WINDOW (not the console)")

# Poll until login completes
for i in range(120):
    time.sleep(5)
    url = driver.current_url
    if "accounts/login" not in url and "accounts/password" not in url and "accounts/emailsignup" not in url:
        logger.info(f"URL: {url}")
        break
    if i % 12 == 0:
        print(f"Waiting for login... ({i*5}s)")
else:
    logger.error("Login timeout")
    driver.quit()
    exit(1)

logger.info("Logged in! Waiting for page to settle...")
time.sleep(5)
driver.refresh()  # fresh load of homepage
time.sleep(6)

# Save cookies
cookies = driver.get_cookies()
with open("instagram_cookies.json", "w", encoding="utf-8") as f:
    json.dump(cookies, f, ensure_ascii=False, indent=2)
logger.info(f"Saved {len(cookies)} cookies")

wait = WebDriverWait(driver, 30)

# Dismiss any popups/overlays
def dismiss_popups():
    js = """
    // Click any backdrop/overlay close buttons
    var closeButtons = document.querySelectorAll('div[role="dialog"] svg, div[role="presentation"] svg');
    for (var b of closeButtons) {
        var aria = b.getAttribute('aria-label') || '';
        if (aria.includes('Close') || aria.includes('\\u0625\\u063a\\u0644\\u0627\\u0642')) {
            b.click(); return true;
        }
    }
    // Click "Not Now" type buttons
    var notNow = ['Not Now', '\\u0644\\u0627 \\u0627\\u0644\\u0622\\u0646', 'Cancel', '\\u0625\\u0644\\u063a\\u0627\\u0621'];
    var allBtns = document.querySelectorAll('button, div[role="button"]');
    for (var b of allBtns) {
        if (notNow.includes(b.textContent.trim())) { b.click(); return true; }
    }
    return false;
    """
    try:
        driver.execute_script(js)
        time.sleep(2)
    except Exception:
        pass

dismiss_popups()

# DEBUG: dump sidebar
sidebar_info = driver.execute_script("""
var links = document.querySelectorAll('a[role="link"]');
return Array.from(links).map(function(l) { return l.getAttribute('href') + ' | ' + l.innerHTML.slice(0,80); });
""")
for item in sidebar_info:
    logger.info(f"SIDEBAR: {item}")

# Try to find and click the create (+) button
clicked = False

# Strategy 1: SVG aria-label
for aria in ["New post", "New", "Create", "\u0625\u0646\u0634\u0627\u0621"]:
    try:
        svg = driver.find_element(By.CSS_SELECTOR, f"svg[aria-label='{aria}']")
        parent = svg.find_element(By.XPATH, "..")
        while parent.tag_name not in ["a", "button"] and parent.get_attribute("role") != "button":
            parent = parent.find_element(By.XPATH, "..")
        parent.click()
        clicked = True
        logger.info(f"Clicked + via SVG '{aria}'")
        break
    except Exception:
        continue

# Strategy 2: link with /create/
if not clicked:
    try:
        el = driver.find_element(By.CSS_SELECTOR, "a[href*='/create']")
        el.click()
        clicked = True
        logger.info("Clicked via /create/ link")
    except Exception:
        pass

# Strategy 3: JS comprehensive scan
if not clicked:
    js_scan = """
var result = { found: false, candidates: [] };
var els = document.querySelectorAll('a, div[role="button"], button');
for (var el of els) {
    var txt = el.textContent.trim().toLowerCase();
    var href = el.getAttribute('href') || '';
    var html = el.innerHTML.toLowerCase();
    var aria = el.getAttribute('aria-label') || '';
    if (href.includes('/create') || txt.includes('create') || txt.includes('new') || txt.includes('\\u0625\\u0646\\u0634\\u0627\\u0621') || html.includes('svg')){
        result.candidates.push({ tag: el.tagName, href: href, text: txt.slice(0,30), aria: aria.slice(0,30) });
        if (href.includes('/create') || txt.includes('create') || txt.includes('\\u0625\\u0646\\u0634\\u0627\\u0621')) {
            el.click();
            result.found = true;
        }
    }
    // also check child SVGs
    var svgs = el.querySelectorAll('svg');
    for (var s of svgs) {
        var sa = s.getAttribute('aria-label') || '';
        if (sa.includes('New') || sa.includes('Create') || sa.includes('\\u0625\\u0646\\u0634\\u0627\\u0621')) {
            result.candidates.push({ tag: el.tagName + '>svg', text: txt.slice(0,30), aria: sa.slice(0,30) });
            el.click();
            result.found = true;
        }
    }
}
return result;
"""
    try:
        result = driver.execute_script(js_scan)
        logger.info(f"JS scan: found={result.get('found')}, candidates={len(result.get('candidates',[]))}")
        for c in result.get('candidates', [])[:5]:
            logger.info(f"  candidate: {c}")
        if result.get('found'):
            clicked = True
    except Exception as e:
        logger.error(f"JS scan error: {e}")

if not clicked:
    logger.error("Could not find + button")
    driver.save_screenshot("debug_no_plus.png")
    with open("debug_no_plus.html", "w", encoding="utf-8") as f:
        f.write(driver.page_source)
    driver.quit()
    exit(1)

time.sleep(4)

# After clicking +, handle dropdown (Post, Story, Reel, etc.)
try:
    post_opt = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//span[contains(text(), 'Post') or contains(text(), '\\u0645\\u0646\\u0634\\u0648\\u0631')]")
    ))
    post_opt.click()
    logger.info("Clicked Post in dropdown")
    time.sleep(3)
except Exception:
    logger.info("No dropdown - maybe file picker already open")

# Upload file
try:
    fi = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']")))
    fi.send_keys(os.path.abspath(IMAGE_PATH))
    logger.info("File uploaded")
except Exception as e:
    logger.error(f"Upload failed: {e}")
    driver.save_screenshot("debug_upload.png")
    with open("debug_upload.html", "w", encoding="utf-8") as f:
        f.write(driver.page_source)
    driver.quit()
    exit(1)

time.sleep(3)

# Click Next x2
for _ in range(2):
    try:
        n = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//div[contains(text(), 'Next') or contains(text(), '\\u0627\\u0644\\u062a\\u0627\\u0644\\u064a')]")
        ))
        n.click()
        time.sleep(2)
    except Exception:
        pass

# Write caption
try:
    ca = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "div[aria-label='Write a caption'], div[aria-label='\\u0627\\u0643\\u062a\\u0628 \\u062a\\u0639\\u0644\\u064a\\u0642']")
    ))
    ca.send_keys(CAPTION)
    logger.info("Caption written")
except Exception:
    pass

# Click Share
try:
    s = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//div[contains(text(), 'Share') or contains(text(), '\\u0645\\u0634\\u0627\\u0631\\u0643\\u0629')]")
    ))
    s.click()
    time.sleep(5)
    logger.info("POSTED SUCCESSFULLY!")
except Exception as e:
    logger.error(f"Share failed: {e}")
    driver.save_screenshot("debug_share.png")

print("\nDone! Browser stays open for 2 min.")
time.sleep(120)
driver.quit()
