from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import health, trips, itinerary
from app.core.config import API_TITLE, FRONTEND_ORIGIN


app = FastAPI(title=API_TITLE)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(health.router)
app.include_router(trips.router)
app.include_router(itinerary.router)


@app.get("/")
def read_root():
    return {
        "message": "Personalized Travel Itinerary Planner API",
        "docs": "/docs",
    }