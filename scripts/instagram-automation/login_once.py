"""
One-time setup: logs into Instagram and saves cookies for automation.
Run:  python login_once.py

A browser window will open. If Instagram shows a challenge,
complete it in the browser, then press Enter here.
"""
import logging
from instagram_selenium import login

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("setup")

try:
    driver = login(headless=False)
    driver.quit()
    print("\nSUCCESS! Cookies saved. Now you can run: python main.py")
except Exception as e:
    print(f"\nError: {e}")
