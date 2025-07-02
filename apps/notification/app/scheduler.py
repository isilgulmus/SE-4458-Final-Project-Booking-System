# scheduler.py
import time
import json
from datetime import datetime
from redis import Redis
from redis import Redis
from redis import Redis
from redis import Redis
from redis import Redis
from redis_client import redis_client

def scheduled_task():
    print(f"⏰ Running capacity check @ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    for key in redis_client.scan_iter("hotels:*"):
        try:
            hotel_rooms = json.loads(redis_client.get(key))
            for room in hotel_rooms:
                if room["room_count"] <= 2:
                    print(f"🔔 WARNING: {room['hotel_name']} in {room['location']} has only {room['room_count']} room(s) left on {key.split(':')[1]}")
        except Exception as e:
            print(f"❌ Error processing {key}: {e}")

if __name__ == "__main__":
    while True:
        scheduled_task()
        time.sleep(60 * 60)  
