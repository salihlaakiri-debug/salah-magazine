import time
from selenium import webdriver
from selenium.webdriver.edge.options import Options
from selenium.webdriver.edge.service import Service
from webdriver_manager.microsoft import EdgeChromiumDriverManager

opts = Options()
opts.add_argument("--window-size=900,800")
opts.add_argument("--lang=ar")
opts.add_experimental_option("excludeSwitches", ["enable-automation"])
opts.add_experimental_option("useAutomationExtension", False)
driver = webdriver.Edge(
    service=Service(EdgeChromiumDriverManager().install()),
    options=opts
)
driver.execute_script(
    "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
)
driver.get("https://www.instagram.com/")
time.sleep(3600)
