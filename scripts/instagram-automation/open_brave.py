import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import tempfile, os

user_data_dir = os.path.join(tempfile.gettempdir(), "brave_selenium_" + str(int(time.time())))

opts = Options()
opts.binary_location = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
opts.add_argument("--window-size=900,800")
opts.add_argument("--lang=ar")
opts.add_argument("--disable-blink-features=AutomationControlled")
opts.add_argument("--user-data-dir=" + user_data_dir)
opts.add_argument("--no-first-run")
opts.add_argument("--disable-sync")
opts.add_experimental_option("excludeSwitches", ["enable-automation"])
opts.add_experimental_option("useAutomationExtension", False)
driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=opts
)
driver.execute_script(
    "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
)
driver.get("https://www.instagram.com/")
time.sleep(3600)
