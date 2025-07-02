# notifications_routes.py
from fastapi import APIRouter, Depends
from app.auth import get_current_user, require_role
from app.redis_client import redis_client
import json

router = APIRouter()

@router.get("/", dependencies=[Depends(require_role("admin"))])
def get_admin_notifications(user=Depends(get_current_user)):
    raw = redis_client.lrange("admin_notifications", 0, -1)
    notifications = [json.loads(item) for item in raw]
    return {"notifications": notifications}
