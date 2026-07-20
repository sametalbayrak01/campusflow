from collections.abc import Mapping
from datetime import time

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.course import Course
from app.models.schedule import ScheduleEntry


class ScheduleEntryNotFoundError(Exception):
    """Raised when a requested schedule entry does not exist."""


class ScheduleCourseNotFoundError(Exception):
    """Raised when a schedule entry references a missing course."""


class ScheduleConflictError(Exception):
    """Raised when two schedule entries overlap on the same weekday."""


def list_entries(db: Session) -> list[ScheduleEntry]:
    statement = (
        select(ScheduleEntry)
        .options(joinedload(ScheduleEntry.course))
        .order_by(ScheduleEntry.weekday, ScheduleEntry.start_time)
    )
    return list(db.scalars(statement))


def get_entry(db: Session, entry_id: int) -> ScheduleEntry:
    statement = (
        select(ScheduleEntry)
        .options(joinedload(ScheduleEntry.course))
        .where(ScheduleEntry.id == entry_id)
    )
    entry = db.scalar(statement)
    if entry is None:
        raise ScheduleEntryNotFoundError
    return entry


def create_entry(db: Session, values: Mapping[str, object]) -> ScheduleEntry:
    course = _get_course(db, int(values["course_id"]))
    weekday = int(values["weekday"])
    start_time = values["start_time"]
    end_time = values["end_time"]
    assert isinstance(start_time, time)
    assert isinstance(end_time, time)
    _ensure_no_conflict(db, weekday, start_time, end_time)

    entry = ScheduleEntry(**values)
    entry.course = course
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def update_entry(
    db: Session,
    entry_id: int,
    changes: Mapping[str, object],
) -> ScheduleEntry:
    entry = get_entry(db, entry_id)
    course_id = int(changes.get("course_id", entry.course_id))
    weekday = int(changes.get("weekday", entry.weekday))
    start_time = changes.get("start_time", entry.start_time)
    end_time = changes.get("end_time", entry.end_time)
    assert isinstance(start_time, time)
    assert isinstance(end_time, time)

    if start_time >= end_time:
        raise ValueError("end_time must be after start_time")
    _ensure_no_conflict(db, weekday, start_time, end_time, excluding_id=entry.id)

    if course_id != entry.course_id:
        entry.course = _get_course(db, course_id)
    for field, value in changes.items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


def delete_entry(db: Session, entry_id: int) -> None:
    entry = get_entry(db, entry_id)
    db.delete(entry)
    db.commit()


def _get_course(db: Session, course_id: int) -> Course:
    course = db.get(Course, course_id)
    if course is None:
        raise ScheduleCourseNotFoundError
    return course


def _ensure_no_conflict(
    db: Session,
    weekday: int,
    start_time: time,
    end_time: time,
    excluding_id: int | None = None,
) -> None:
    statement = select(ScheduleEntry.id).where(
        ScheduleEntry.weekday == weekday,
        ScheduleEntry.start_time < end_time,
        ScheduleEntry.end_time > start_time,
    )
    if excluding_id is not None:
        statement = statement.where(ScheduleEntry.id != excluding_id)
    if db.scalar(statement) is not None:
        raise ScheduleConflictError
