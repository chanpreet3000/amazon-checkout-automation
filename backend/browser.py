import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


def get_browser(headless=False, eager=True):
    user_data_dir = os.path.join(os.getcwd(), 'chrome_user_data')
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={user_data_dir}")
    chrome_options.add_argument("--start-maximized")
    if not eager:
        chrome_options.page_load_strategy = 'none'
    if headless:
        chrome_options.add_argument("--headless")
    return webdriver.Chrome(options=chrome_options)

# chrome_options.add_argument("--no-sandbox")
# chrome_options.add_argument("--disable-dev-shm-usage")
