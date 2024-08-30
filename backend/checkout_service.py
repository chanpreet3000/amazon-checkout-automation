from typing import List

from selenium.common import TimeoutException
from selenium.webdriver.support.select import Select

from Logger import Logger
from utils import get_browser, sleep
from models import CheckoutInput, ScrapedData, CheckoutError

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def subscribe_item_and_checkout(driver, item: ScrapedData):
    try:
        sleep(1, 2)
        Logger.info('Subscribing & Checking out item', item)
        url = item.url
        quantity = str(item.quantity)
        driver.get(url)

        wait = WebDriverWait(driver, 10)

        # Wait for and click the Subscribe & Save option
        sleep(0.6, 1)
        sns_element = wait.until(EC.element_to_be_clickable((By.ID, "snsAccordionRowMiddle")))
        sns_element.click()

        Logger.info('Clicked on Subscribe & Save')

        # Wait for the quantity select element to load and select the quantity
        sleep(0.6, 0.8)
        quantity_select = Select(wait.until(EC.presence_of_element_located((By.ID, "rcxsubsQuan"))))
        quantity_select.select_by_value(quantity)
        Logger.info('Selected the Quantity')

        # Click the "Subscribe Now" button
        sleep(1, 1.2)
        subscribe_button = wait.until(EC.element_to_be_clickable((By.ID, "rcx-subscribe-submit-button-announce")))
        driver.execute_script("arguments[0].click();", subscribe_button)
        Logger.info('Clicked on Submit/Add to Cart')

        wait_small = WebDriverWait(driver, 5)
        try:
            sleep(1, 1.5)
            no_thanks_button = wait_small.until(
                EC.element_to_be_clickable((By.ID, "prime-interstitial-nothanks-button")))
            no_thanks_button.click()
            Logger.info('Clicked "No thanks, continue without Prime"')
        except TimeoutException as e:
            Logger.info('No Prime subscription page found', e)

        sleep(1.3, 1.5)
        confirm_subscription_button = wait_small.until(
            EC.element_to_be_clickable((By.ID, "bottomSubmitOrderButtonId"))
        )
        driver.execute_script("arguments[0].click();", confirm_subscription_button)
        Logger.info('Clicked on Confirm Subscription')

        # Check for duplicate order confirmation
        try:
            sleep(0.6, 0.8)
            duplicate_order_button = wait_small.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//input[@name='forcePlaceOrder'][@value='Place this duplicate order']"))
            )
            driver.execute_script("arguments[0].click();", duplicate_order_button)
            Logger.info('Clicked on Place this duplicate order')
        except TimeoutException:
            Logger.info('No duplicate order confirmation found')

        # Wait for the confirmation page to load
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        # Check for the specific h4 element indicating successful subscription
        success_indicator = "//h4[@class='a-alert-heading'][contains(text(), 'Subscription confirmed, thanks.')]"

        try:
            wait.until(EC.presence_of_element_located((By.XPATH, success_indicator)))
            Logger.info('Subscription confirmed successfully')
        except TimeoutException as e:
            Logger.error('Subscription confirmation not found', e)
            raise e

    except Exception as e:
        Logger.error(f"Error during checkout for {item.title}", e)
        raise e


def checkout_service(checkout_input: CheckoutInput) -> List[CheckoutError]:
    Logger.info('Checkout Service is initiated with input', checkout_input)
    errors = []
    driver = get_browser(email=checkout_input.email)

    for item in checkout_input.data:
        try:
            subscribe_item_and_checkout(driver, item)
        except Exception as e:
            errors.append(CheckoutError(message=f'Error occurred in {item.title}', error=str(e)))

    Logger.info('Checkout Service Ended with response', errors)
    return errors
