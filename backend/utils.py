import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import random
import time


def get_browser(email, headless=False, eager=True):
    user_data_dir = os.path.join(os.getcwd(), f'chrome_user_data/{email}')
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={user_data_dir}")
    chrome_options.add_argument("--start-maximized")
    if not eager:
        chrome_options.page_load_strategy = 'none'
    if headless:
        chrome_options.add_argument("--headless")
    return webdriver.Chrome(options=chrome_options)


def sleep(min_delay: float = 1, max_delay: float = 3):
    sleep_time = random.uniform(min_delay, max_delay)
    time.sleep(sleep_time)
