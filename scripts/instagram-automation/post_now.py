"""
Phase 1: Opens Edge, waits for user to login.
Phase 2: Posts automatically.
"""
import os, json, time, logging
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.edge.options import Options
from selenium.webdriver.edge.service import Service
from webdriver_manager.microsoft import EdgeChromiumDriverManager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("auto")

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

# Phase 1: Wait for user to login (poll URL)
print("Please login in the browser window. Waiting...")
for i in range(180):
    time.sleep(5)
    url = driver.current_url
    if "accounts/login" not in url and "accounts/password" not in url:
        logger.info(f"Login detected! URL: {url}") if i > 0 else None
        break
    if i == 0:
        print("Waiting for login... (script will auto-detect)")
else:
    logger.error("Login timeout")
    driver.quit()
    exit(1)

# Phase 2: Post
logger.info("Starting post...")
time.sleep(5)

# Save cookies
with open("instagram_cookies.json", "w", encoding="utf-8") as f:
    json.dump(driver.get_cookies(), f, ensure_ascii=False, indent=2)

wait = WebDriverWait(driver, 30)

# Dismiss popups
driver.execute_script("""
document.querySelectorAll('div[role="dialog"] svg, div[role="presentation"] svg').forEach(function(b){
    var a = b.getAttribute('aria-label')||'';
    if(a.includes('Close')||a.includes('\\u0625\\u063a\\u0644\\u0627\\u0642')) b.click();
});
var n = ['Not Now','\\u0644\\u0627 \\u0627\\u0644\\u0622\\u0646'];
document.querySelectorAll('button, div[role="button"]').forEach(function(b){
    if(n.includes(b.textContent.trim())) b.click();
});
""")
time.sleep(2)

# Strategy: navigate directly to /create/ (not /create/select/)
logger.info("Navigating to /create/...")
new_url = "https://www.instagram.com/create/"
driver.get(new_url)
time.sleep(8)
logger.info(f"URL after navigation: {driver.current_url}")

# If still on login/explore pages, the session might be lost
if "accounts/login" in driver.current_url:
    logger.error("Session lost on navigation - need to re-login")
    # Wait for user to relogin
    print("Session expired. Please login again in the browser...")
    for i in range(180):
        time.sleep(5)
        url = driver.current_url
        if "accounts/login" not in url:
            logger.info(f"Re-login detected! URL: {url}")
            time.sleep(5)
            break
    else:
        logger.error("Re-login timeout")
        driver.quit()
        exit(1)
    # Try again
    driver.get(new_url)
    time.sleep(8)

# Now look for file input
try:
    fi = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']")))
    fi.send_keys(os.path.abspath(IMAGE_PATH))
    logger.info("File uploaded!")
except Exception as e:
    logger.error(f"Upload: {e}")
    driver.save_screenshot("debug_upload.png")
    with open("debug_upload.html", "w", encoding="utf-8") as f:
        f.write(driver.page_source)
    driver.quit()
    exit(1)

time.sleep(3)

# Next x2
for txt in ["Next", "\\u0627\\u0644\\u062a\\u0627\\u0644\\u064a"]:
    for _ in range(2):
        try:
            wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//div[contains(text(), '" + txt + "')]")
            )).click()
            time.sleep(2)
        except Exception:
            pass

# Caption
try:
    ca = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "div[aria-label='Write a caption'], div[aria-label='\\u0627\\u0643\\u062a\\u0628 \\u062a\\u0639\\u0644\\u064a\\u0642']")
    ))
    ca.send_keys(CAPTION)
    logger.info("Caption written")
except Exception:
    pass

# Share
for txt in ["Share", "\\u0645\\u0634\\u0627\\u0631\\u0643\\u0629"]:
    try:
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//div[contains(text(), '" + txt + "')]")
        )).click()
        time.sleep(5)
        logger.info("POSTED SUCCESSFULLY!")
        break
    except Exception:
        continue

print("Done! Browser stays open 2 min.")
time.sleep(120)
driver.quit()
