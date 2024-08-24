from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
import os

from models import ScrapedData


class AmazonScraper:
    def __init__(self):
        self.driver = None
        self.user_data_dir = os.path.join(os.getcwd(), 'chrome_user_data')

    def setup_driver(self):
        chrome_options = Options()
        chrome_options.add_argument(f"user-data-dir={self.user_data_dir}")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-dev-shm-usage")
        self.driver = webdriver.Chrome(options=chrome_options)

    def get_select_options(self, select_id):
        try:
            select_element = WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.ID, select_id))
            )
            select = Select(select_element)
            return [{'value': option.get_attribute('value'), 'text': option.text} for option in select.options]
        except (NoSuchElementException, TimeoutException):
            print(f"Select element with id '{select_id}' not found")
            return []

    def scrape_product(self, url_or_asin) -> ScrapedData:
        if not self.driver:
            self.setup_driver()

        # If ASIN is provided, construct the Amazon URL
        if len(url_or_asin) == 10 and url_or_asin.isalnum():
            url = f"https://www.amazon.co.uk/dp/{url_or_asin}"
        else:
            url = url_or_asin

        self.driver.get(url)

        try:
            wait = WebDriverWait(self.driver, 10)
            product_title = wait.until(EC.presence_of_element_located((By.ID, "productTitle")))
            title = product_title.text
            try:
                img_element = self.driver.find_element(By.ID, "landingImage")
                img_url = img_element.get_attribute("src")
            except NoSuchElementException:
                img_url = None
                print(f"Main product image not found for {title}")

            try:
                sns_element = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.ID, "snsAccordionRowMiddle"))
                )
                sns_element.click()
                print(f"Clicked on Subscribe & Save option for {title}")

                # Get options for quantity and frequency
                quantity_options = self.get_select_options("rcxsubsQuan")
                frequency_options = self.get_select_options("rcxOrdFreqSns")

            except (NoSuchElementException, TimeoutException):
                print(f"Subscribe & Save option not found or not clickable for {title}")
                quantity_options = []
                frequency_options = []

            return ScrapedData(
                url=url,
                title=title,
                img_url=img_url,
                quantity_options=quantity_options,
                frequency_options=frequency_options,
                status="PROCESSED"
            )

        except Exception as e:
            print(f"Error scraping product: {str(e)}")
            return ScrapedData(
                url=url,
                title=None,
                img_url=None,
                quantity_options=[],
                frequency_options=[],
                status="PROCESSED"
            )
