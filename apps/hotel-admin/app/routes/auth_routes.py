from fastapi import APIRouter, HTTPException
from app.auth import create_token
from app.models import User
from app.database import SessionLocal
from sqlalchemy.orm import Session
from app.schemas import UserLogin, UserRegister, UserOut

router = APIRouter()

def get_user_from_db(username: str, db: Session):
    return db.query(User).filter(User.username == username).first()

@router.post("/login")
def login(data: UserLogin):  
    db = SessionLocal()
    user = get_user_from_db(data.username, db)
    if not user or user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({
        "sub": user.username,
        "role": user.role,
        "id": user.id
    })

    return {"access_token": token}

@router.post("/register", response_model=UserOut)
def register(data: UserRegister):
    db = SessionLocal()
    if get_user_from_db(data.username, db):
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = User(
        username=data.username,
        password=data.password,
        role=data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
