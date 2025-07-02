from fastapi import APIRouter, Depends
from app.schemas import SearchRequest
from app.auth import get_optional_user
from app.redis_client import redis_client
from datetime import datetime, timedelta
import json
import unicodedata

router = APIRouter()

def normalize(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8").lower()

@router.post("/", response_model=dict)
def search_hotels(data: SearchRequest, user=Depends(get_optional_user)):
    start_date = data.start_date
    end_date = data.end_date
    days = (end_date - start_date).days or 1
    matched = {}

    current = start_date
    while current < end_date:
        key = f"hotels:{current.isoformat()}"
        hotels_json = redis_client.get(key)
        if not hotels_json:
            current += timedelta(days=1)
            continue

        hotels = json.loads(hotels_json)
        for h in hotels:
            if (
                normalize(h["location"]) == normalize(data.location)
                and h["capacity"] >= data.guest_count
                and h["start_date"] <= data.start_date.isoformat() <= h["end_date"]
            ):
                room_id = h["id"]
                matched.setdefault(room_id, {**h, "available_days": 0})
                matched[room_id]["available_days"] += 1

        current += timedelta(days=1)

    filtered = []
    for m in matched.values():
        if m["available_days"] >= days:
            price = m["price_per_night"] * days
            discounted_for = None
            if user:
                price *= 0.85
                discounted_for = user["username"]

            filtered.append({
                "id": m["id"],
                "hotel_name": m["hotel_name"],
                "location": m["location"],
                "room_type": m["room_type"],
                "room_count": m["room_count"],
                "capacity": m["capacity"],
                "start_date": m["start_date"],
                "end_date": m["end_date"],
                "price_per_night": m["price_per_night"],
                "final_price": round(price, 2),
                "discounted_for": discounted_for,
            })

    return {"results": filtered}
