from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from models import ScrapedData, URLInput
from scrapper import AmazonScraper

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


@app.post("/process_url", response_model=ScrapedData)
async def process_url(url_input: URLInput):
    scraper = AmazonScraper()
    return scraper.scrape_product(url_input.url)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
