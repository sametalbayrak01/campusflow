from collections.abc import Mapping

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.course import Course
from app.models.exam import Exam


class ExamNotFoundError(Exception):
    pass


class ExamCourseNotFoundError(Exception):
    pass


def list_exams(db: Session) -> list[Exam]:
    return list(
        db.scalars(
            select(Exam).options(joinedload(Exam.course)).order_by(Exam.exam_date, Exam.start_time)
        )
    )


def get_exam(db: Session, exam_id: int) -> Exam:
    exam = db.scalar(select(Exam).options(joinedload(Exam.course)).where(Exam.id == exam_id))
    if exam is None:
        raise ExamNotFoundError
    return exam


def create_exam(db: Session, values: Mapping[str, object]) -> Exam:
    course = _course(db, int(values["course_id"]))
    exam = Exam(**values)
    exam.course = course
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return exam


def update_exam(db: Session, exam_id: int, changes: Mapping[str, object]) -> Exam:
    exam = get_exam(db, exam_id)
    if "course_id" in changes and int(changes["course_id"]) != exam.course_id:
        exam.course = _course(db, int(changes["course_id"]))
    for field, value in changes.items():
        setattr(exam, field, value)
    db.commit()
    db.refresh(exam)
    return exam


def delete_exam(db: Session, exam_id: int) -> None:
    exam = get_exam(db, exam_id)
    db.delete(exam)
    db.commit()


def _course(db: Session, course_id: int) -> Course:
    course = db.get(Course, course_id)
    if course is None:
        raise ExamCourseNotFoundError
    return course
