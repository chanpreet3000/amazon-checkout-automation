import asyncio
from typing import List

from selenium.common import TimeoutException, WebDriverException
from selenium.webdriver.support.select import Select

from Logger import Logger
from browser import get_browser
from models import CheckoutInput, ScrapedData, CheckoutError

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


async def add_item_to_cart(driver, item: ScrapedData):
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
        await asyncio.sleep(0.4)

        Logger.info('Clicked on Subscribe & Save')

        # Select quantity
        quantity_select = Select(wait.until(EC.presence_of_element_located((By.ID, "rcxsubsQuan"))))
        quantity_select.select_by_value(quantity)
        await asyncio.sleep(0.8)

        Logger.info('Selected the Quantity')

        # Click the "Subscribe Now" button
        subscribe_button = wait.until(
            EC.element_to_be_clickable((By.ID, "rcx-subscribe-submit-button-announce"))
        )
        driver.execute_script("arguments[0].click();", subscribe_button)

        Logger.info('Clicked on Submit/Add to Cart')

        wait2 = WebDriverWait(driver, 4)
        try:
            wait2.until(EC.presence_of_element_located((By.ID, "sc-buy-box-ptc-button")))
            Logger.info('Successfully added to cart')
        except TimeoutException as e:
            try:
                Logger.error('Failed to verify added to cart or not. It maybe due to Amazon Prime Subscription page', e)

                no_thanks_button = wait.until(
                    EC.element_to_be_clickable((By.ID, "prime-interstitial-nothanks-button")))
                no_thanks_button.click()

                Logger.info('Clicked "No thanks, continue without Prime"')
            except TimeoutException as e:
                Logger.error('Unable to find "No thanks" button or cart button. Checkout process may have failed.', e)
                raise e

    except Exception as e:
        Logger.error(f"Error during checkout for {item.url}", e)
        raise e


async def add_all_items_to_cart_and_checkout(email, checkout_cart: List[ScrapedData]) -> List[CheckoutError]:
    Logger.info('Checkout initiated for a cart with details', checkout_cart)
    Logger.info('Adding items to cart')
    errors = []
    driver = get_browser(email=email)
    try:
        for item in checkout_cart:
            try:
                await add_item_to_cart(driver, item)
            except Exception as e:
                errors.append(CheckoutError(message=f'{item.title}', error=str(e)))

        Logger.info('All items added to cart')

        # Go to the cart page
        Logger.info('Initiating checkout process')
        driver.get("https://www.amazon.co.uk/gp/cart/view.html")

        # wait = WebDriverWait(driver, 15)
        # Wait for the "Proceed to checkout" button and click it
        # checkout_button = wait.until(EC.element_to_be_clickable((By.NAME, "proceedToRetailCheckout")))
        # checkout_button.click()
        #
        # Logger.info('Checkout Button Clicked')

        Logger.info('Waiting for 20 minutes to allow user to complete payment')
        for _ in range(20 * 60):
            await asyncio.sleep(1)
            try:
                driver.title
            except WebDriverException as e:
                Logger.error("Browser was closed before payment was completed", e)
                raise e

        Logger.info('Wait period for payment completed')

    except Exception as e:
        Logger.error('An error occurred during the checkout process', e)
        errors.append(CheckoutError(message='An error occurred during the checkout process', error=str(e)))
    finally:
        driver.quit()

    return errors


async def checkout_service(checkout_input: CheckoutInput) -> List[List[CheckoutError]]:
    Logger.info('Checkout Service is initiated with input', checkout_input)

    result = []
    for checkout_cart in checkout_input.data:
        errors = await add_all_items_to_cart_and_checkout(checkout_input.email, checkout_cart)
        result.append(errors)

    Logger.info('Checkout Service Ended with response', result)
    return result
