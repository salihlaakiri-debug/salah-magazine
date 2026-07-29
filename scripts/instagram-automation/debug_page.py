import json, os, time, logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options
from selenium.webdriver.edge.service import Service
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

COOKIES_FILE = "instagram_cookies.json"

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
time.sleep(3)

if os.path.exists(COOKIES_FILE):
    with open(COOKIES_FILE) as f:
        cookies = json.load(f)
    for c in cookies:
        try:
            driver.add_cookie(c)
        except Exception as e:
            logger.warning(f"Cookie error: {e}")
    logger.info(f"Loaded {len(cookies)} cookies")
    driver.refresh()
    time.sleep(5)

url = driver.current_url
logger.info(f"Current URL: {url}")
ts = datetime.now().strftime("%H%M%S")
driver.save_screenshot(f"debug_page_{ts}.png")

# Check for login form
try:
    inp = driver.find_element(By.CSS_SELECTOR, "input[name='email']")
    logger.info("LOGIN FORM IS VISIBLE - cookies expired")
except Exception:
    logger.info("No login form - cookies seem valid")

# Check what's on the page
page_text = driver.find_element(By.TAG_NAME, "body").text[:2000]
logger.info(f"Page text: {page_text}")

# Dump all SVG aria-labels
svgs = driver.find_elements(By.CSS_SELECTOR, "svg")
for svg in svgs:
    aria = svg.get_attribute("aria-label")
    if aria:
        logger.info(f"SVG aria-label: [{aria}]")

# Dump role=button elements
btns = driver.find_elements(By.CSS_SELECTOR, "div[role='button']")
for b in btns:
    txt = b.text[:60]
    logger.info(f"Button role: [{txt}]")

input("Press Enter to quit...")
driver.quit()
