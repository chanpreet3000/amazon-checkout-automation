from typing import List

from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from selenium.webdriver.support import expected_conditions as EC
from fastapi import FastAPI, WebSocket

from Logger import Logger
from browser import NonHeadlessBrowser

from models import CheckoutInput, BatchProductInput, ProgressUpdate, ScrapedData
from scrapper import scrape_product, checkout_automation

import asyncio

app = FastAPI()

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Error handling middleware
class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as e:
            Logger.critical("An internal server error occurred", e)
            return JSONResponse(
                status_code=500,
                content={"message": f"An internal server error occurred: {str(e)}"}
            )


app.add_middleware(ErrorHandlerMiddleware)


def group_products(product: ScrapedData, requested_quantity: int) -> List[dict]:
    max_quantity = max([int(option['value']) for option in product.quantity_options], default=1)
    groups = []
    fullObjects = requested_quantity // max_quantity
    remainder = requested_quantity % max_quantity

    for i in range(fullObjects):
        product.quantity = max_quantity
        groups.append(product.dict())

    if remainder > 0:
        product.quantity = remainder
        groups.append(product.dict())

    return groups


def merge_groups(groups: List[List[dict]]) -> List[List[dict]]:
    max_len = max([len(group) for group in groups], default=0)
    merged = [[] for _ in range(max_len)]
    for group in groups:
        for i, ele in enumerate(group):
            merged[i].append(ele)

    return merged


@app.websocket("/batch_process_products")
async def batch_process_products(websocket: WebSocket):
    await websocket.accept()

    try:
        data = await websocket.receive_json()
        batch_input = BatchProductInput(**data)

        results = []
        error_results = []
        total = len(batch_input.products)
        Logger.info('Batch processing started', batch_input.products)

        for i, product in enumerate(batch_input.products, 1):
            scraped_data = scrape_product(product.url_or_asin)
            if scraped_data.status == "ERROR":
                error_results.append(scraped_data.dict())
            else:
                grouped_products = group_products(scraped_data, int(product.quantity))
                results.append(grouped_products)
            await websocket.send_json(ProgressUpdate(processed=i, total=total).dict())

            # Add a small delay to avoid overwhelming the server
            await asyncio.sleep(0.1)

        Logger.info('Batch processing Ended', results)
        merged_result = merge_groups(results)
        Logger.info('Merged Batches', merged_result)
        response = {"results": merged_result, "error_results": error_results}
        Logger.info('Batch processing Response', response)
        await websocket.send_json(response)

    except Exception as e:
        await websocket.send_json({"error": str(e)})

    finally:
        await websocket.close()


@app.get("/open_amazon_signin")
async def open_amazon_signin():
    Logger.info('Opening Amazon sign-in page')
    signin_url = "https://www.amazon.co.uk/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.co.uk%2Fref%3Dnav_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=gbflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0"
    driver = NonHeadlessBrowser.get_driver()
    driver.get(signin_url)
    return {"message": "Amazon sign-in page opened successfully"}


@app.post("/checkout")
async def checkout(checkout_input: CheckoutInput):
    Logger.info('Checkout initiated', checkout_input)

    driver = NonHeadlessBrowser.get_driver()
    try:
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

        # Wait for the checkout page to load
        wait.until(EC.presence_of_element_located((By.ID, "checkoutDisplayPage")))

        return {
            "message": "Checkout process initiated. The response will be sent when you close the browser.",
        }
    except Exception as e:
        driver.quit()
        Logger.error('An error occurred during the checkout process', e)
        return {
            "message": "An error occurred during the checkout process",
            "error": str(e),
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
