import asyncio
from typing import Dict

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from fastapi import WebSocket

from utils import get_browser, sleep
from models import ScrapedData, BatchProductInput, ProgressUpdate
from Logger import Logger


def scrape_product_details(driver, url_or_asin: str) -> ScrapedData:
    Logger.info("Starting Scraping URL", url_or_asin)
    sleep(1, 2)

    try:
        if not url_or_asin.startswith('https'):
            url = f"https://www.amazon.co.uk/dp/{url_or_asin}"
        else:
            url = url_or_asin

        driver.get(url)

        wait = WebDriverWait(driver, 8)

        # Scrape Product Title
        try:
            product_title = wait.until(EC.presence_of_element_located((By.ID, "productTitle")))
            title = product_title.text
            Logger.info("title found", title)
        except NoSuchElementException:
            Logger.error("No Product Title found")
            title = None

        # Scrape Image Url
        try:
            img_element = driver.find_element(By.ID, "landingImage")
            img_url = img_element.get_attribute("src")
            Logger.info("Img Url found", img_url)
        except NoSuchElementException:
            Logger.error("No Product Url found")
            img_url = None

        try:
            sleep(0.2, 0.7)
            # Wait and click the Subscribe & Save toggle option
            sns_element = wait.until(
                EC.element_to_be_clickable((By.ID, "snsAccordionRowMiddle"))
            )
            sns_element.click()
            Logger.info('Clicked on Subscribe & Save')

            # Wait and get quantity options
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


async def batch_process_products_service(websocket: WebSocket):
    await websocket.accept()
    data = await websocket.receive_json()
    batch_input = BatchProductInput(**data)
    driver = get_browser(headless=True, eager=False, email=batch_input.email)
    try:
        Logger.info('Batch processing started', batch_input)

        results = []
        error_results = []
        processed_count = 0
        total_products = len(batch_input.products)
        url_to_scraped_data_map: Dict[str, ScrapedData] = {}

        for product in batch_input.products:
            if product.url_or_asin in url_to_scraped_data_map:
                scraped_data = url_to_scraped_data_map[product.url_or_asin]
            else:
                scraped_data = scrape_product_details(driver, product.url_or_asin)
                url_to_scraped_data_map[product.url_or_asin] = scraped_data

            max_quantity = max(int(option['value']) for option in scraped_data.quantity_options)
            scraped_data.quantity = min(int(product.quantity), max_quantity)

            if scraped_data.status == "ERROR":
                error_results.append(scraped_data.dict())
            else:
                results.append(scraped_data.dict())

            processed_count += 1

            await websocket.send_json(ProgressUpdate(processed=processed_count, total=total_products).dict())
            await asyncio.sleep(0.1)

        response = {"results": results, "error_results": error_results}
        Logger.info('Batch processing Response', response)

        await asyncio.sleep(1)
        await websocket.send_json(response)

    except Exception as e:
        await websocket.send_json({"error": str(e)})

    finally:
        driver.quit()
        await websocket.close()
