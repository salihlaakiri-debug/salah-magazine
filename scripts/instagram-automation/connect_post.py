import time
import json
import os
import logging
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager, ChromeType

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("post")

opts = Options()
opts.debugger_address = "127.0.0.1:9222"
driver = webdriver.Chrome(service=Service(ChromeDriverManager(driver_version="150.0.7871.186").install()), options=opts)
url = driver.current_url
logger.info(f"Connected! URL: {url}")

if "accounts/login" in url:
    logger.error("Not logged in!")
    driver.quit()
    exit(1)

wait = WebDriverWait(driver, 30)
IMAGE_PATH = os.path.abspath("generated_images\\8b80e1f5-1a02-4301-b3cf-b7987a30d446.png")
CAPTION = "مطر من ورق\n\n#شعر #أدب #السدفة"

# Navigate to create page
logger.info("Going to /create/ ...")
driver.get("https://www.instagram.com/create/")
time.sleep(10)
logger.info(f"Now at: {driver.current_url}")

if "accounts/login" in driver.current_url:
    logger.error("Session lost on navigation!")
    driver.quit()
    exit(1)

# Find file input and upload
logger.info("Looking for file input...")
try:
    fi = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']")))
    logger.info("Found file input, sending keys...")
    fi.send_keys(IMAGE_PATH)
    logger.info("File sent!")
except Exception as e:
    logger.error(f"Upload error: {e}")
    driver.save_screenshot("debug_upload.png")
    with open("debug_upload.html", "w", encoding="utf-8") as f:
        f.write(driver.page_source)
    driver.quit()
    exit(1)

time.sleep(4)

# Next x2
for txt in ["Next", "التالي"]:
    for _ in range(2):
        try:
            btn = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//div[contains(text(), '" + txt + "')]")
            ))
            btn.click()
            logger.info(f"Clicked {txt}")
            time.sleep(2)
        except Exception:
            pass

# Caption
try:
    ca = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "div[aria-label='Write a caption'], div[aria-label='اكتب تعليق']")
    ))
    ca.send_keys(CAPTION)
    logger.info("Caption written")
except Exception as e:
    logger.info(f"No caption area: {e}")

# Share
for txt in ["Share", "مشاركة"]:
    try:
        btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//div[contains(text(), '" + txt + "')]")
        ))
        btn.click()
        time.sleep(5)
        logger.info("POSTED SUCCESSFULLY!")
        break
    except Exception:
        continue

logger.info("Done")
driver.quit()
