from pydantic import BaseModel
from typing import List, Optional


class URLInput(BaseModel):
    url: str


class ScrapedData(BaseModel):
    url: str
    title: Optional[str]
    img_url: Optional[str]
    quantity_options: List[dict]
    frequency_options: List[dict]
    status: str
