import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


class HeadlessBrowser:
    _instance = None

    @classmethod
    def get_driver(cls):
        if cls._instance is None or not cls._is_browser_alive():
            cls._instance = cls._create_driver()
        return cls._instance

    @staticmethod
    def _create_driver():
        user_data_dir = os.path.join(os.getcwd(), 'chrome_user_data')
        chrome_options = Options()
        chrome_options.add_argument(f"user-data-dir={user_data_dir}")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.page_load_strategy = 'none'
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--enable-cookies")
        return webdriver.Chrome(options=chrome_options)

    @classmethod
    def _is_browser_alive(cls):
        try:
            # Check if the browser is still responsive
            cls._instance.title
            return True
        except:
            return False


class NonHeadlessBrowser:
    _instance = None

    @classmethod
    def get_driver(cls):
        if cls._instance is None or not cls._is_browser_alive():
            cls._instance = cls._create_driver()
        return cls._instance

    @staticmethod
    def _create_driver():
        user_data_dir = os.path.join(os.getcwd(), 'chrome_user_data')
        chrome_options = Options()
        chrome_options.add_argument(f"user-data-dir={user_data_dir}")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.page_load_strategy = 'none'
        chrome_options.add_argument("--enable-cookies")
        return webdriver.Chrome(options=chrome_options)

    @classmethod
    def _is_browser_alive(cls):
        try:
            # Check if the browser is still responsive
            cls._instance.title
            return True
        except:
            return False

    @classmethod
    def wait_for_browser_close(cls):
        if cls._instance:
            cls._instance.wait_for_new_window()