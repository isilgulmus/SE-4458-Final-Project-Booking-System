from fastapi import FastAPI
from app.routes import booking_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Booking Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend development adresi
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(booking_routes.router, prefix="/api/v1/book")
