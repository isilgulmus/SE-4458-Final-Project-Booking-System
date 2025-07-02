from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Room
from app.schemas import RoomCreate
from app.auth import get_current_user, require_role
from app.redis_client import redis_client
from datetime import timedelta
import json
import unicodedata

router = APIRouter()

# Unicode karakterleri normalize eden yardımcı fonksiyon
def normalize(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8").lower()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_date_range(start_date, end_date):
    current = start_date
    while current <= end_date:
        yield current
        current += timedelta(days=1)

@router.post("/", dependencies=[Depends(require_role("admin"))])
def add_room(
    room: RoomCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    db_room = Room(**room.dict(), user_id=user["id"])
    db.add(db_room)
    db.commit()
    db.refresh(db_room)

    for date in get_date_range(room.start_date, room.end_date):
        key = f"hotels:{date.isoformat()}"
        existing = redis_client.get(key)
        hotel_list = json.loads(existing) if existing else []

        hotel_list.append({
            "id": db_room.id,
            "hotel_name": room.hotel_name,
            "location": normalize(room.location),  # ✅ Normalized
            "room_type": room.room_type,
            "room_count": room.room_count,
            "capacity": room.capacity,
            "start_date": room.start_date.isoformat(),
            "end_date": room.end_date.isoformat(),
            "price_per_night": room.price_per_night
        })

        redis_client.set(key, json.dumps(hotel_list))

    return {"message": "Room added"}

@router.get("/")
def list_rooms(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    total = db.query(Room).count()
    items = db.query(Room).offset(skip).limit(limit).all()
    return {
        "total": total,
        "items": items
    }

@router.get("/{room_id}")
def get_room_by_id(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.put("/{id}", dependencies=[Depends(require_role("admin"))])
def update_room(
    id: int,
    room: RoomCreate,
    db: Session = Depends(get_db)
):
    db_room = db.query(Room).filter(Room.id == id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Eski kayıtları Redis'ten temizle
    for date in get_date_range(db_room.start_date, db_room.end_date):
        key = f"hotels:{date.isoformat()}"
        cached = redis_client.get(key)
        if cached:
            hotel_list = json.loads(cached)
            hotel_list = [r for r in hotel_list if r.get("id") != db_room.id]
            redis_client.set(key, json.dumps(hotel_list))

    # Veritabanını güncelle
    for key, value in room.dict().items():
        setattr(db_room, key, value)
    db.commit()
    db.refresh(db_room)

    # Güncellenmiş kayıtları Redis'e yeniden ekle
    for date in get_date_range(room.start_date, room.end_date):
        key = f"hotels:{date.isoformat()}"
        cached = redis_client.get(key)
        hotel_list = json.loads(cached) if cached else []

        hotel_list.append({
            "id": db_room.id,
            "hotel_name": room.hotel_name,
            "location": normalize(room.location),  # ✅ Normalized
            "room_type": room.room_type,
            "room_count": room.room_count,
            "capacity": room.capacity,
            "start_date": room.start_date.isoformat(),
            "end_date": room.end_date.isoformat(),
            "price_per_night": room.price_per_night
        })

        redis_client.set(key, json.dumps(hotel_list))

    return {"message": "Room updated successfully"}

@router.delete("/{id}", dependencies=[Depends(require_role("admin"))])
def delete_room(id: int, db: Session = Depends(get_db)):
    db_room = db.query(Room).filter(Room.id == id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")

    for date in get_date_range(db_room.start_date, db_room.end_date):
        key = f"hotels:{date.isoformat()}"
        cached = redis_client.get(key)
        if cached:
            hotel_list = json.loads(cached)
            hotel_list = [r for r in hotel_list if r.get("id") != db_room.id]
            redis_client.set(key, json.dumps(hotel_list))

    db.delete(db_room)
    db.commit()
    return {"message": "Room deleted successfully"}
