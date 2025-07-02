from pydantic import BaseModel
from datetime import date
from typing import Optional

class SearchRequest(BaseModel):
    location: str
    start_date: date
    end_date: date
    guest_count: int

class SearchResult(BaseModel):
    id: int
    hotel_name: str
    location: str
    room_type: str
    room_count: int
    capacity: int
    start_date: str
    end_date: str
    price_per_night: float
    final_price: float
    discounted_for: Optional[str] = None
