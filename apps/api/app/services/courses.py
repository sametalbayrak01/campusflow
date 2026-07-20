from collections.abc import Mapping

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.course import Course


class CourseNotFoundError(Exception):
    """Raised when a requested course does not exist."""


class CourseCodeConflictError(Exception):
    """Raised when a course code would violate its uniqueness constraint."""


def list_courses(db: Session) -> list[Course]:
    return list(db.scalars(select(Course).order_by(Course.code)))


def get_course(db: Session, course_id: int) -> Course:
    course = db.get(Course, course_id)
    if course is None:
        raise CourseNotFoundError
    return course


def create_course(db: Session, values: Mapping[str, object]) -> Course:
    course = Course(**values)
    db.add(course)
    _commit(db)
    db.refresh(course)
    return course


def update_course(db: Session, course_id: int, changes: Mapping[str, object]) -> Course:
    course = get_course(db, course_id)
    for field, value in changes.items():
        setattr(course, field, value)
    _commit(db)
    db.refresh(course)
    return course


def delete_course(db: Session, course_id: int) -> None:
    course = get_course(db, course_id)
    db.delete(course)
    db.commit()


def _commit(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise CourseCodeConflictError from error
