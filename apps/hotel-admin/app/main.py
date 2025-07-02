from fastapi import FastAPI
from app.routes import auth_routes, room_routes
from app.database import engine, Base
from app.models import User
from app.database import SessionLocal
from fastapi.middleware.cors import CORSMiddleware

from app.routes.notifications_routes import router as notifications_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hotel Admin Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(room_routes.router, prefix="/api/v1/rooms", tags=["Rooms"])
app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["Notifications"])

@app.on_event("startup")
def startup():
    db = SessionLocal()
    if not db.query(User).filter(User.username == "admin").first():
        db.add(User(username="admin", password="1234", role="admin"))
    if not db.query(User).filter(User.username == "user").first():
        db.add(User(username="user", password="abcd", role="user"))
    db.commit()
    db.close()
