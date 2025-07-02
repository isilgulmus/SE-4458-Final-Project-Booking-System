from pydantic import BaseModel
from datetime import date
from typing import List

class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    password: str
    role: str = "user"

class UserOut(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        orm_mode = True

class RoomCreate(BaseModel):
    hotel_name: str
    location: str
    capacity: int
    room_type: str
    room_count: int
    price_per_night: float
    start_date: date
    end_date: date

class RoomOut(RoomCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

