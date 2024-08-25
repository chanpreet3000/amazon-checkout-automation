from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from browser import get_non_headless_browser, get_headless_browser
from models import ScrapedData, URLInput
from scrapper import scrape_product

app = FastAPI()

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust this to your frontend URL
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
            return JSONResponse(
                status_code=500,
                content={"message": f"An internal server error occurred: {str(e)}"}
            )


app.add_middleware(ErrorHandlerMiddleware)

head_driver = get_non_headless_browser()
headless_driver = get_headless_browser()


@app.post("/process_url", response_model=ScrapedData)
async def process_url(url_input: URLInput):
    return scrape_product(head_driver, url_input.url)


@app.on_event("shutdown")
def shutdown_event():
    head_driver.quit()
    headless_driver.quit()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
