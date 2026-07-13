from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseRead, CourseUpdate

router = APIRouter(prefix="/api/courses", tags=["courses"])


def find_course(course_id: int, db: Session) -> Course:
    course = db.get(Course, course_id)
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course


@router.get("", response_model=list[CourseRead])
def list_courses(db: Session = Depends(get_db)) -> list[Course]:
    return list(db.scalars(select(Course).order_by(Course.code)))


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
def create_course(payload: CourseCreate, db: Session = Depends(get_db)) -> Course:
    course = Course(**payload.model_dump())
    db.add(course)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A course with this code already exists",
        ) from error
    db.refresh(course)
    return course


@router.get("/{course_id}", response_model=CourseRead)
def get_course(course_id: int, db: Session = Depends(get_db)) -> Course:
    return find_course(course_id, db)


@router.patch("/{course_id}", response_model=CourseRead)
def update_course(
    course_id: int,
    payload: CourseUpdate,
    db: Session = Depends(get_db),
) -> Course:
    course = find_course(course_id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(course, field, value)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A course with this code already exists",
        ) from error
    db.refresh(course)
    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(get_db)) -> Response:
    course = find_course(course_id, db)
    db.delete(course)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
