from sqlalchemy import Column, Integer, String, Date, ForeignKey, Float
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="user")  # 'admin' veya 'user'

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    hotel_name = Column(String)
    location = Column(String)
    capacity = Column(Integer)
    room_type = Column(String)
    room_count = Column(Integer)
    price_per_night = Column(Float)
    start_date = Column(Date)
    end_date = Column(Date)
    user_id = Column(Integer, ForeignKey("users.id"))  # Önceden: admin_id
