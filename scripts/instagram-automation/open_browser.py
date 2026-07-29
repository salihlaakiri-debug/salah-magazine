"""
Just opens Edge browser to Instagram. User does everything manually.
"""
import time
from selenium import webdriver
from selenium.webdriver.edge.options import Options
from selenium.webdriver.edge.service import Service
from webdriver_manager.microsoft import EdgeChromiumDriverManager

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

# Keep open 30 minutes
time.sleep(1800)
driver.quit()
