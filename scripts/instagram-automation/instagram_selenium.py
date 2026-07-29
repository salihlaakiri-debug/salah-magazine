import os
import json
import time
import logging
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.edge.options import Options
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.webdriver.edge.service import Service
from config import config

logger = logging.getLogger(__name__)

COOKIES_FILE = "instagram_cookies.json"
_USERNAME = config.INSTAGRAM_USERNAME
_PASSWORD = config.INSTAGRAM_PASSWORD


def _get_driver(headless=False):
    opts = Options()
    opts.add_argument("--window-size=900,800")
    opts.add_argument("--lang=ar")
    opts.add_argument("--disable-blink-features=AutomationControlled")
    opts.add_experimental_option("excludeSwitches", ["enable-automation"])
    opts.add_experimental_option("useAutomationExtension", False)
    if headless:
        opts.add_argument("--headless")
    service = Service(EdgeChromiumDriverManager().install())
    driver = webdriver.Edge(service=service, options=opts)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver


def _save_cookies(driver):
    cookies = driver.get_cookies()
    with open(COOKIES_FILE, "w", encoding="utf-8") as f:
        json.dump(cookies, f, ensure_ascii=False, indent=2)
    logger.info(f"Saved {len(cookies)} cookies")


def _load_cookies(driver):
    if not os.path.exists(COOKIES_FILE):
        return False
    with open(COOKIES_FILE, encoding="utf-8") as f:
        cookies = json.load(f)
    for cookie in cookies:
        try:
            driver.add_cookie(cookie)
        except Exception:
            pass
    logger.info(f"Loaded {len(cookies)} cookies")
    return True


def login(headless=False):
    driver = _get_driver(headless=headless)
    driver.get("https://www.instagram.com/accounts/login/")
    wait = WebDriverWait(driver, 20)

    try:
        username_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        username_input.send_keys(_USERNAME)
        password_input = driver.find_element(By.NAME, "pass")
        password_input.send_keys(_PASSWORD)
        password_input.send_keys(Keys.RETURN)

        time.sleep(10)

        if "challenge" in driver.current_url:
            logger.info("Challenge page detected")
            if not headless:
                input("Complete the challenge in the browser, then press Enter here...")
            else:
                logger.error("Challenge requires manual intervention")
                driver.quit()
                raise Exception("Challenge required")

        # Wait for page to transition after login
        time.sleep(8)

        # Check if login actually succeeded (not still on login page)
        current_url = driver.current_url
        logger.info(f"Current URL after login: {current_url}")

        # Check for error messages
        try:
            error_el = driver.find_element(By.CSS_SELECTOR, "p[role='alert'], div[role='alert']")
            logger.error(f"Login error detected: {error_el.text}")
        except Exception:
            pass

        if "accounts/login" in current_url or "accounts/emailsignup" in current_url:
            logger.error("Still on login page after login attempt - login failed silently")
            driver.quit()
            raise Exception("Instagram login failed - still on login page")

        logger.info("Login successful")
        time.sleep(3)
        debug_dir = "debug_screenshots"
        os.makedirs(debug_dir, exist_ok=True)
        try:
            ts = datetime.now().strftime("%H%M%S")
            driver.save_screenshot(os.path.join(debug_dir, f"post_login_{ts}.png"))
            with open(os.path.join(debug_dir, f"post_login_{ts}.html"), "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            logger.info(f"Saved post-login state to {debug_dir}/")
        except Exception:
            pass
        return driver

    except Exception as e:
        logger.error(f"Login failed: {e}")
        driver.quit()
        raise


def _dismiss_popups(driver):
    js = """
// Click any overlay/backdrop
var overlays = document.querySelectorAll('div[role="dialog"], div[role="presentation"], div.x1n2onr6');
for (var o of overlays) {
    try {
        var closeBtn = o.querySelector('svg[aria-label="Close"], svg[aria-label="\\u0625\\u063a\\u0644\\u0627\\u0642"], button, div[role="button"]');
        if (closeBtn) { closeBtn.click(); return true; }
    } catch(e) {}
}
// Click "Not Now" / "\\u0644\\u0627 \\u0627\\u0644\\u0622\\u0646" buttons
var notNow = document.querySelectorAll('button, div[role="button"]');
for (var b of notNow) {
    var txt = b.textContent.trim();
    if (txt.includes('\\u0644\\u0627 \\u0627\\u0644\\u0622\\u0646') || txt.includes('Not Now') || txt.includes('Save') || txt.includes('\\u062d\\u0641\\u0638')) {
        b.click(); return true;
    }
}
return false;
"""
    try:
        driver.execute_script(js)
        time.sleep(2)
    except Exception:
        pass


def post_photo(driver, image_path: str, caption: str) -> bool:
    wait = WebDriverWait(driver, 30)
    try:
        _dismiss_popups(driver)

        # Try multiple strategies to click the create (+) button
        clicked = False

        # Strategy 1: aria-label with "New post" or "Create" or "إنشاء"
        for aria in ["New post", "New", "Create", "إنشاء", "إضافة", "جديد"]:
            try:
                el = driver.find_element(By.CSS_SELECTOR, f"svg[aria-label='{aria}']")
                parent = el.find_element(By.XPATH, "..")
                while parent and parent.tag_name not in ["a", "button"] and parent.get_attribute("role") != "button":
                    parent = parent.find_element(By.XPATH, "..")
                parent.click()
                clicked = True
                logger.info(f"Clicked via aria-label '{aria}'")
                break
            except Exception:
                continue

        # Strategy 2: Link with /create/ in href
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
            js = """
var candidates = [];
// all links and buttons
document.querySelectorAll('a, div[role="button"], button, span[role="button"]').forEach(function(el) {
    var html = el.innerHTML.toLowerCase();
    var txt = el.textContent.trim().toLowerCase();
    var href = el.getAttribute('href') || '';
    if (href.includes('/create') || html.includes('plus') || html.includes('+') || 
        txt.includes('create') || txt.includes('new') || txt.includes('\\u0625\\u0646\\u0634\\u0627\\u0621') || txt.includes('\\u062c\\u062f\\u064a\\u062f') || txt.includes('\\u0625\\u0636\\u0627\\u0641\\u0629')) {
        candidates.push(el);
    }
    // also check aria-label of children
    var children = el.querySelectorAll('svg, img');
    for (var c of children) {
        var aria = c.getAttribute('aria-label') || '';
        if (aria.includes('New') || aria.includes('Create') || aria.includes('\\u0625\\u0646\\u0634\\u0627\\u0621')) {
            candidates.push(el);
        }
    }
});
if (candidates.length > 0) {
    candidates[0].click();
    return true;
}
return false;
"""
            try:
                clicked = driver.execute_script(js)
                if clicked:
                    logger.info("Clicked via JS comprehensive scan")
            except Exception:
                pass

        if not clicked:
            logger.error("Could not find create button")
            debug_dir = "debug_screenshots"
            os.makedirs(debug_dir, exist_ok=True)
            ts = datetime.now().strftime("%H%M%S")
            driver.save_screenshot(os.path.join(debug_dir, f"no_create_btn_{ts}.png"))
            with open(os.path.join(debug_dir, f"page_no_create_{ts}.html"), "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            return False
        time.sleep(5)

        file_input = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "input[type='file']")
        ))
        file_input.send_keys(os.path.abspath(image_path))
        time.sleep(3)

        next_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//div[contains(text(), 'Next') or contains(text(), 'التالي')]")
        ))
        next_btn.click()
        time.sleep(2)

        next_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//div[contains(text(), 'Next') or contains(text(), 'التالي')]")
        ))
        next_btn.click()
        time.sleep(2)

        caption_area = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "div[aria-label='Write a caption'], div[aria-label='اكتب تعليق']")
        ))
        caption_area.send_keys(caption)

        share_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//div[contains(text(), 'Share') or contains(text(), 'مشاركة')]")
        ))
        share_btn.click()
        time.sleep(5)

        logger.info("Posted successfully via Selenium")
        return True

    except Exception as e:
        import traceback
        logger.error(f"Post failed: {e}")
        debug_dir = "debug_screenshots"
        os.makedirs(debug_dir, exist_ok=True)
        try:
            ts = datetime.now().strftime("%H%M%S")
            driver.save_screenshot(os.path.join(debug_dir, f"debug_{ts}.png"))
            with open(os.path.join(debug_dir, f"page_{ts}.html"), "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            logger.info(f"Saved debug files to {debug_dir}/")
        except Exception as ss_err:
            logger.error(f"Could not save debug info: {ss_err}")
        return False


def post_to_instagram(image_path: str, caption: str) -> bool:
    driver = None
    try:
        if os.path.exists(COOKIES_FILE):
            driver = _get_driver(headless=False)
            driver.get("https://www.instagram.com/")
            time.sleep(2)
            _load_cookies(driver)
            driver.refresh()
            time.sleep(4)

            try:
                driver.find_element(By.CSS_SELECTOR, "input[name='email']")
                logger.info("Cookies expired, logging in fresh...")
                old_driver = driver
                driver = None
                old_driver.quit()
                driver = login(headless=False)
            except Exception:
                pass

        if not driver:
            logger.info("No active driver, logging in fresh...")
            driver = login(headless=False)

        if not driver:
            logger.error("No driver available")
            return False

        result = post_photo(driver, image_path, caption)
        _save_cookies(driver)
        return result

    except Exception as e:
        logger.error(f"Overall post failed: {e}")
        return False

    finally:
        if driver:
            time.sleep(2)
            driver.quit()
