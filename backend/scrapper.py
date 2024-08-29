import asyncio
from collections import defaultdict
from typing import List

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from fastapi import WebSocket

from browser import get_browser
from models import ScrapedData, BatchProductInput, ProgressUpdate, ProductInput
from Logger import Logger


def group_products(scraped_product: ScrapedData, products: List[ProductInput]) -> List[dict]:
    groups = []
    max_quantity = max(int(option['value']) for option in scraped_product.quantity_options)

    for product in products:
        temp = scraped_product.copy()  # Create a copy to avoid modifying the original
        requested_quantity = int(product.quantity)
        temp.quantity = min(requested_quantity, max_quantity)  # Set to lower of requested or max available
        groups.append(temp.dict())

    return groups


def merge_groups(groups: List[List[dict]]) -> List[List[dict]]:
    max_len = max([len(group) for group in groups], default=0)
    merged = [[] for _ in range(max_len)]
    for group in groups:
        for i, ele in enumerate(group):
            merged[i].append(ele)

    return merged


def scrape_product(driver, url_or_asin: str) -> ScrapedData:
    Logger.info("Starting Scraping URL", url_or_asin)

    try:
        if not url_or_asin.startswith('https'):
            url = f"https://www.amazon.co.uk/dp/{url_or_asin}"
        else:
            url = url_or_asin

        driver.get(url)

        wait = WebDriverWait(driver, 8)

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


async def batch_process_products_service(websocket: WebSocket):
    await websocket.accept()
    data = await websocket.receive_json()
    batch_input = BatchProductInput(**data)
    driver = get_browser(headless=True, eager=False, email=batch_input.email)
    try:
        results = []
        error_results = []
        Logger.info('Batch processing started', batch_input)

        url_map = defaultdict(list)

        for product in batch_input.products:
            url_map[product.url_or_asin].append(product)

        url_map = dict(url_map)
        Logger.info('URL MAP', url_map)

        processed_count = 0
        total_products = len(batch_input.products)

        for url_or_asin, products in url_map.items():
            scraped_data = scrape_product(driver, url_or_asin)

            if scraped_data.status == "ERROR":
                error_results.append(scraped_data.dict())
            else:
                grouped_products = group_products(scraped_data, products)
                results.append(grouped_products)

            processed_count += len(products)
            await websocket.send_json(ProgressUpdate(processed=processed_count, total=total_products).dict())

            await asyncio.sleep(0.1)

        Logger.info('Batch processing Ended', results)

        merged_result = merge_groups(results)
        Logger.info('Merged Batches', merged_result)

        response = {"results": merged_result, "error_results": error_results}
        Logger.info('Batch processing Response', response)

        await asyncio.sleep(1)
        await websocket.send_json(response)

    except Exception as e:
        await websocket.send_json({"error": str(e)})

    finally:
        driver.quit()
        await websocket.close()
