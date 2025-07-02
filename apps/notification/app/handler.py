from redis_client import redis_client
import json
from datetime import datetime

def handle_booking_message(data: dict):
    print("📦 NEW BOOKING RECEIVED")
    print(f"🏨 Hotel: {data['hotel']} in {data['location']}")
    print(f"👥 Guests: {data['guest_count']} | Rooms Reserved: {data['reserved_rooms']}")
    print(f"📅 Dates: {data['start_date']} to {data['end_date']}")

    notification = {
        "timestamp": datetime.utcnow().isoformat(),
        "hotel": data["hotel"],
        "location": data["location"],
        "room_type": data["room_type"],
        "guest_count": data["guest_count"],
        "start_date": data["start_date"],
        "end_date": data["end_date"],
        "user": data["user"]["username"]
    }

    redis_client.rpush("admin_notifications", json.dumps(notification))
    print("📬 Notification pushed to Redis ✅\n")
