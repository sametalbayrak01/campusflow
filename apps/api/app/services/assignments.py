from collections.abc import Mapping

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.assignment import Assignment
from app.models.course import Course


class AssignmentNotFoundError(Exception):
    """Raised when a requested assignment does not exist."""


class AssignmentCourseNotFoundError(Exception):
    """Raised when an assignment references a missing course."""


def list_assignments(db: Session) -> list[Assignment]:
    statement = (
        select(Assignment)
        .options(joinedload(Assignment.course))
        .order_by(Assignment.completed, Assignment.due_date, Assignment.id)
    )
    return list(db.scalars(statement))


def get_assignment(db: Session, assignment_id: int) -> Assignment:
    statement = (
        select(Assignment)
        .options(joinedload(Assignment.course))
        .where(Assignment.id == assignment_id)
    )
    assignment = db.scalar(statement)
    if assignment is None:
        raise AssignmentNotFoundError
    return assignment


def create_assignment(db: Session, values: Mapping[str, object]) -> Assignment:
    course = _get_course(db, int(values["course_id"]))
    assignment = Assignment(**values)
    assignment.course = course
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


def update_assignment(
    db: Session,
    assignment_id: int,
    changes: Mapping[str, object],
) -> Assignment:
    assignment = get_assignment(db, assignment_id)
    if "course_id" in changes and int(changes["course_id"]) != assignment.course_id:
        assignment.course = _get_course(db, int(changes["course_id"]))
    for field, value in changes.items():
        setattr(assignment, field, value)
    db.commit()
    db.refresh(assignment)
    return assignment


def delete_assignment(db: Session, assignment_id: int) -> None:
    assignment = get_assignment(db, assignment_id)
    db.delete(assignment)
    db.commit()


def _get_course(db: Session, course_id: int) -> Course:
    course = db.get(Course, course_id)
    if course is None:
        raise AssignmentCourseNotFoundError
    return course
