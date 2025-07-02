from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Comment(BaseModel):
    hotel_name: str
    comment: str
    rating: int = Field(..., ge=1, le=5)
    created_at: Optional[datetime] = None
