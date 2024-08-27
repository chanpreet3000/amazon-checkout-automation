import asyncio

from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from selenium.common import WebDriverException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from fastapi import FastAPI, WebSocket

from Logger import Logger
from browser import get_browser
from checkout_service import checkout_service

from models import CheckoutInput
from scrapper import batch_process_products_service

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


@app.websocket("/batch_process_products")
async def batch_process_products(websocket: WebSocket):
    return await batch_process_products_service(websocket)


@app.get("/open_amazon_signin")
async def open_amazon_signin():
    driver = get_browser()
    try:
        Logger.info('Opening Amazon sign-in page')
        signin_url = "https://www.amazon.co.uk/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.co.uk%2Fref%3Dnav_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=gbflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0"
        driver.get(signin_url)

        Logger.info('Waiting for 10 minutes to allow user to sign in & accept cookies')
        for _ in range(10 * 60):
            await asyncio.sleep(1)
            try:
                driver.title
            except WebDriverException:
                Logger.error("Browser was closed")
                return {"message": "Successfully Signed In"}

        return {"message": "User Not logged In. Timed out (10 minutes)"}
    except Exception as e:
        Logger.error('An error occurred during the Amazon sign-in process', e)
        return {"message": "An error occurred during the Amazon sign-in process"}

    finally:
        driver.quit()


@app.post("/checkout")
async def checkout(checkout_input: CheckoutInput):
    return await checkout_service(checkout_input)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
