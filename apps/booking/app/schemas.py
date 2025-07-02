from pydantic import BaseModel
from datetime import date

class BookingRequest(BaseModel):
    room_id: int
    start_date: date
    end_date: date
    guest_count: int
