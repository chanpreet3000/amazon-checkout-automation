import asyncio

from selenium.common import TimeoutException, StaleElementReferenceException, WebDriverException
from selenium.webdriver.support.select import Select

from Logger import Logger
from browser import get_browser
from models import CheckoutInput, ScrapedData

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


# Currently not using this function. It is for clearing the cart before adding new items
def clear_cart(driver):
    # clear the cart
    Logger.info('Clearing the cart first')
    try:
        # Navigate to the cart page
        driver.get("https://www.amazon.co.uk/gp/cart/view.html")

        wait = WebDriverWait(driver, 10)  # Increased timeout

        max_attempts = 1
        attempt = 0

        while attempt < max_attempts:
            try:
                # Check if there are items in the cart
                items = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.sc-list-item-content")))

                if not items:
                    Logger.info("Cart is empty")
                    return

                # Find and click the delete button for the first item
                delete_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[value='Delete']")))
                driver.execute_script("arguments[0].click();", delete_button)

                # Wait for the page to reload
                wait.until(EC.staleness_of(delete_button))

                # Reset attempt counter on successful deletion
                attempt = 0

            except (StaleElementReferenceException, TimeoutException):
                attempt += 1
                Logger.warn(f"Attempt {attempt} failed to clear an item. Retrying...")
                driver.refresh()  # Refresh the page to handle potential loading issues

        if attempt == max_attempts:
            Logger.error("Failed to clear the cart after maximum attempts")
        else:
            Logger.info("Cart cleared successfully")

    except Exception as e:
        Logger.error("Error while clearing the cart", e)


async def checkout_automation(driver, item: ScrapedData):
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

                no_thanks_button = wait2.until(
                    EC.element_to_be_clickable((By.ID, "prime-interstitial-nothanks-button")))
                no_thanks_button.click()
                Logger.info('Clicked "No thanks, continue without Prime"')

                # Wait for the cart page after clicking "No thanks"
                wait2.until(EC.presence_of_element_located((By.ID, "sc-buy-box-ptc-button")))
                Logger.info('Successfully added to cart after declining Prime')
            except TimeoutException as e:
                Logger.error('Unable to find "No thanks" button or cart button. Checkout process may have failed.', e)

    except Exception as e:
        Logger.error(f"Error during checkout for {item.url}", e)


async def checkout_service(checkout_input: CheckoutInput):
    Logger.info('Checkout initiated', checkout_input)

    driver = get_browser()
    try:
        # clear_cart(driver)

        for item in checkout_input.data:
            await checkout_automation(driver, item)

        wait = WebDriverWait(driver, 15)

        Logger.info('Initiating checkout process')

        # Go to the cart page
        driver.get("https://www.amazon.co.uk/gp/cart/view.html")

        # Wait for the "Proceed to checkout" button and click it
        # checkout_button = wait.until(EC.element_to_be_clickable((By.NAME, "proceedToRetailCheckout")))
        # checkout_button.click()
        #
        # Logger.info('Checkout Button Clicked')

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
