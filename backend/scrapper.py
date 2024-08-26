from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException

from browser import HeadlessBrowser
from models import ScrapedData
from Logger import Logger


def scrape_product(url_or_asin: str) -> ScrapedData:
    driver = HeadlessBrowser.get_driver()
    Logger.info("Starting Scraping URL", url_or_asin)

    try:
        if not url_or_asin.startswith('https'):
            url = f"https://www.amazon.co.uk/dp/{url_or_asin}"
        else:
            url = url_or_asin

        driver.get(url)

        wait = WebDriverWait(driver, 15)

        # Wait only for the specific elements you need
        product_title = wait.until(EC.presence_of_element_located((By.ID, "productTitle")))
        title = product_title.text
        Logger.info("title found", title)

        try:
            img_element = driver.find_element(By.ID, "landingImage")
            img_url = img_element.get_attribute("src")
            Logger.info("Img Url found", img_url)
        except NoSuchElementException:
            Logger.error("No Product Url found")
            img_url = None

        try:
            sns_element = wait.until(
                EC.element_to_be_clickable((By.ID, "snsAccordionRowMiddle"))
            )
            sns_element.click()
            Logger.info('Clicked on Subscribe & Save')

            select_element = wait.until(
                EC.presence_of_element_located((By.ID, "rcxsubsQuan"))
            )
            select = Select(select_element)
            quantity_options = [{'value': option.get_attribute('value'), 'text': option.text.strip()} for option in
                                select.options]

            Logger.info("Quantity Options found", quantity_options)
        except (NoSuchElementException, TimeoutException) as e:
            Logger.error("Most likely this product is not available for Subscribe & Save.", e)
            return ScrapedData(
                url=url,
                title=title,
                img_url=img_url,
                quantity_options=[],
                quantity=0,
                status="ERROR",
                error="Most likely this product is not available for Subscribe & Save."
            )

        response = ScrapedData(
            url=url,
            title=title,
            img_url=img_url,
            quantity_options=quantity_options,
            quantity=0,
            status="PROCESSED"
        )
        Logger.info("Successfully scraped data", response)
        return response

    except Exception as e:
        Logger.error("Unexpected Error", e)
        return ScrapedData(
            url=url_or_asin,
            title=None,
            img_url=None,
            quantity_options=[],
            quantity=0,
            status="ERROR",
            error=f"An error occurred while scraping the product: {e}"
        )


def checkout_automation(driver, item: ScrapedData):
    try:
        Logger.info('Checking out item', item)
        url = item.url
        quantity = str(item.quantity)

        driver.get(url)

        wait = WebDriverWait(driver, 15)

        # Wait for and click the Subscribe & Save option
        sns_element = wait.until(
            EC.element_to_be_clickable((By.ID, "snsAccordionRowMiddle"))
        )
        sns_element.click()
        Logger.info('Clicked on Subscribe & Save')

        # Select quantity
        quantity_select = Select(wait.until(EC.presence_of_element_located((By.ID, "rcxsubsQuan"))))
        quantity_select.select_by_value(quantity)

        Logger.info('Selected the Quantity')

        # Click the "Subscribe Now" button
        subscribe_button = wait.until(
            EC.element_to_be_clickable((By.ID, "rcx-subscribe-submit-button-announce"))
        )
        subscribe_button.click()

        Logger.info('Clicked on Submit/Add to Cart')

        # Wait for the cart page to load
        wait.until(EC.presence_of_element_located((By.ID, "sc-buy-box-ptc-button")))

        Logger.info('Added to Cart')

    except Exception as e:
        Logger.error(f"Error during checkout for {item.url}", e)
