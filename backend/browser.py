import os

from selenium import webdriver
from selenium.webdriver.chrome.options import Options


def get_non_headless_browser():
    user_data_dir = os.path.join(os.getcwd(), 'chrome_user_data')
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={user_data_dir}")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=chrome_options)
    return driver


def get_headless_browser():
    user_data_dir = os.path.join(os.getcwd(), 'chrome_user_data')
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={user_data_dir}")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=chrome_options)
    return driver
