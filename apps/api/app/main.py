from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.routers.assignments import router as assignments_router
from app.routers.courses import router as courses_router
from app.routers.schedule import router as schedule_router


class HealthResponse(BaseModel):
    status: str
    service: str


app = FastAPI(
    title="CampusFlow API",
    version="0.1.0",
    description="API for course schedules, assignments, and study planning.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assignments_router)
app.include_router(courses_router)
app.include_router(schedule_router)


@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health() -> HealthResponse:
    return HealthResponse(status="ok", service="campusflow-api")
