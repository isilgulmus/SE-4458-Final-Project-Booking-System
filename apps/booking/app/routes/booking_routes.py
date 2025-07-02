from fastapi import APIRouter, Depends, HTTPException
from app.schemas import BookingRequest
from app.auth import get_current_user
from app.redis_client import redis_client
from app.rabbitmq import send_booking_message
import json
import math
from datetime import timedelta

router = APIRouter()

def date_range(start, end):
    while start <= end:
        yield start
        start += timedelta(days=1)

@router.post("/")
def book_hotel(data: BookingRequest, user=Depends(get_current_user)):
    days_data = []
    total_price = 0
    needed_rooms = None
    selected_room = None

    for current_date in date_range(data.start_date, data.end_date):
        key = f"hotels:{current_date.isoformat()}"
        cached = redis_client.get(key)
        if not cached:
            raise HTTPException(status_code=400, detail=f"No availability for {current_date}")

        rooms = json.loads(cached)
        room = next((r for r in rooms if r["id"] == data.room_id), None)

        if not room:
            raise HTTPException(status_code=400, detail=f"Room not found for {current_date}")

        if needed_rooms is None:
            needed_rooms = math.ceil(data.guest_count / room["capacity"])
            selected_room = room  # Save reference for final message

        if room["room_count"] < needed_rooms:
            raise HTTPException(status_code=400, detail=f"Not enough rooms on {current_date}")

        total_price += room["price_per_night"]
        days_data.append((key, rooms, room))

    for key, rooms, room in days_data:
        for r in rooms:
            if r["id"] == data.room_id:
                r["room_count"] -= needed_rooms
        redis_client.set(key, json.dumps(rooms))

    send_booking_message({
        "user": {
            "id": user["id"],
            "username": user["username"],
            "role": user["role"]
        },
        "hotel": selected_room["hotel_name"],
        "location": selected_room["location"],
        "room_type": selected_room["room_type"],
        "start_date": data.start_date.isoformat(),
        "end_date": data.end_date.isoformat(),
        "guest_count": data.guest_count,
        "reserved_rooms": needed_rooms,
        "total_price": total_price
    })

    return {"message": "Booking confirmed", "total_price": total_price}
