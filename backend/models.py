from pydantic import BaseModel
from typing import List, Optional


class ProductInput(BaseModel):
    url_or_asin: str
    quantity: str


class BatchProductInput(BaseModel):
    products: List[ProductInput]


class ScrapedData(BaseModel):
    url: str
    title: Optional[str]
    img_url: Optional[str]
    quantity_options: List[dict]
    quantity: int
    status: str
    error: Optional[str] = None


class CheckoutInput(BaseModel):
    data: List[ScrapedData]


class BatchScrapedData(BaseModel):
    results: List[ScrapedData]


class ProgressUpdate(BaseModel):
    processed: int
    total: int
