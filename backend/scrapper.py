from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from browser import HeadlessBrowser, NonHeadlessBrowser
from models import ScrapedData, CheckoutInput


def get_select_options(driver, select_id):
    select_element = WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.ID, select_id))
    )
    select = Select(select_element)
    return [{'value': option.get_attribute('value'), 'text': option.text.strip()} for option in select.options]


def scrape_product(url_or_asin: str) -> ScrapedData:
    driver = HeadlessBrowser.get_driver()

    try:
        if not url_or_asin.startswith('https'):
            url = f"https://www.amazon.co.uk/dp/{url_or_asin}"
        else:
            url = url_or_asin

        driver.get(url)

        wait = WebDriverWait(driver, 4)

        # Wait only for the specific elements you need
        product_title = wait.until(EC.presence_of_element_located((By.ID, "productTitle")))
        title = product_title.text

        try:
            img_element = driver.find_element(By.ID, "landingImage")
            img_url = img_element.get_attribute("src")
        except NoSuchElementException:
            img_url = None

        try:
            sns_element = wait.until(
                EC.element_to_be_clickable((By.ID, "snsAccordionRowMiddle"))
            )
            sns_element.click()
            quantity_options = get_select_options(driver, "rcxsubsQuan")
        except (NoSuchElementException, TimeoutException):
            return ScrapedData(
                url=url,
                title=title,
                img_url=img_url,
                quantity_options=[],
                quantity=0,
                status="ERROR",
                error="Most likely this product is not available for Subscribe & Save."
            )

        return ScrapedData(
            url=url,
            title=title,
            img_url=img_url,
            quantity_options=quantity_options,
            quantity=0,
            status="PROCESSED"
        )

    except Exception as e:
        print(f"Error scraping product: {e}")
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
        url = item.url
        quantity = str(item.quantity)

        driver.get(url)

        wait = WebDriverWait(driver, 10)

        # Wait for and click the Subscribe & Save option
        sns_element = wait.until(
            EC.element_to_be_clickable((By.ID, "snsAccordionRowMiddle"))
        )
        sns_element.click()

        # Select quantity
        quantity_select = Select(wait.until(EC.presence_of_element_located((By.ID, "rcxsubsQuan"))))
        quantity_select.select_by_value(quantity)

        # Click the "Subscribe Now" button
        subscribe_button = wait.until(
            EC.element_to_be_clickable((By.ID, "rcx-subscribe-submit-button-announce"))
        )
        subscribe_button.click()

        # Wait for the cart page to load
        wait.until(EC.presence_of_element_located((By.ID, "sc-buy-box-ptc-button")))

    except Exception as e:
        print(f"Error during checkout for {item.url}: {e}")
