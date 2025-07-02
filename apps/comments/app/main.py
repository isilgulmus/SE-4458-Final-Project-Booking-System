from fastapi import FastAPI
from app.routes.comments_routes import router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Comments Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router, prefix="/api/v1/comments", tags=["Comments"])
