import asyncio

from selenium.common import TimeoutException, StaleElementReferenceException, WebDriverException
from selenium.webdriver.support.select import Select

from Logger import Logger
from browser import get_browser
from models import CheckoutInput, ScrapedData

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def clear_cart(driver):
    try:
        # Navigate to the cart page
        driver.get("https://www.amazon.co.uk/gp/cart/view.html")

        wait = WebDriverWait(driver, 4)

        while True:
            try:
                # Check if there are items in the cart
                items = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.sc-list-item-content")))

                if not items:
                    Logger.info("Cart is empty")
                    break

                # Find and click the delete button for the first item
                delete_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[value='Delete']")))
                delete_button.click()

                # Wait for the page to reload
                wait.until(EC.staleness_of(delete_button))

            except StaleElementReferenceException:
                # If we get a stale element, the page has probably updated, so we'll try again
                continue
            except TimeoutException:
                # If we can't find any more items, assume the cart is empty
                Logger.info("No more items found in the cart")
                break

        Logger.info("Cart cleared successfully")

    except Exception as e:
        Logger.error("Error while clearing the cart", e)


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


async def checkout_service(checkout_input: CheckoutInput):
    Logger.info('Checkout initiated', checkout_input)

    driver = get_browser()
    try:

        # clear the cart
        Logger.info('Clearing the cart first')
        clear_cart(driver)

        for item in checkout_input.data:
            checkout_automation(driver, item)

        wait = WebDriverWait(driver, 15)

        Logger.info('Initiating checkout process')

        # Go to the cart page
        driver.get("https://www.amazon.co.uk/gp/cart/view.html")

        # Wait for the "Proceed to checkout" button and click it
        checkout_button = wait.until(EC.element_to_be_clickable((By.NAME, "proceedToRetailCheckout")))
        checkout_button.click()

        Logger.info('Checkout Button Clicked')

        Logger.info('Waiting for 20 minutes to allow user to complete payment')
        for _ in range(20 * 60):
            await asyncio.sleep(1)
            try:
                # Check if the browser window is still open
                driver.title  # Accessing the title to check if the driver is alive
            except WebDriverException:
                Logger.error("Browser was closed before payment was completed")
                return {"message": "Failed: Browser was closed before payment was completed"}

        Logger.info('Wait period for payment completed')

        return {
            "message": "Checkout process initiated. The response will be sent when you close the browser.",
        }
    except Exception as e:
        Logger.error('An error occurred during the checkout process', e)
        return {
            "message": "An error occurred during the checkout process",
            "error": str(e),
        }
    finally:
        driver.quit()
