from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schedule import ScheduleEntry
from app.schemas.schedule import ScheduleEntryCreate, ScheduleEntryRead, ScheduleEntryUpdate
from app.services import schedule as schedule_service

router = APIRouter(prefix="/api/schedule", tags=["schedule"])


def raise_schedule_error(error: Exception) -> None:
    if isinstance(error, schedule_service.ScheduleCourseNotFoundError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        ) from error
    if isinstance(error, schedule_service.ScheduleConflictError):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Schedule entry conflicts with an existing course",
        ) from error
    if isinstance(error, ValueError):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error
    raise error


@router.get("", response_model=list[ScheduleEntryRead])
def list_schedule(db: Session = Depends(get_db)) -> list[ScheduleEntry]:
    return schedule_service.list_entries(db)


@router.post("", response_model=ScheduleEntryRead, status_code=status.HTTP_201_CREATED)
def create_schedule_entry(
    payload: ScheduleEntryCreate,
    db: Session = Depends(get_db),
) -> ScheduleEntry:
    try:
        return schedule_service.create_entry(db, payload.model_dump())
    except (
        schedule_service.ScheduleCourseNotFoundError,
        schedule_service.ScheduleConflictError,
    ) as error:
        raise_schedule_error(error)


@router.patch("/{entry_id}", response_model=ScheduleEntryRead)
def update_schedule_entry(
    entry_id: int,
    payload: ScheduleEntryUpdate,
    db: Session = Depends(get_db),
) -> ScheduleEntry:
    try:
        return schedule_service.update_entry(
            db,
            entry_id,
            payload.model_dump(exclude_unset=True),
        )
    except schedule_service.ScheduleEntryNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule entry not found",
        ) from error
    except (
        schedule_service.ScheduleCourseNotFoundError,
        schedule_service.ScheduleConflictError,
        ValueError,
    ) as error:
        raise_schedule_error(error)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule_entry(entry_id: int, db: Session = Depends(get_db)) -> Response:
    try:
        schedule_service.delete_entry(db, entry_id)
    except schedule_service.ScheduleEntryNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule entry not found",
        ) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
