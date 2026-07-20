from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseRead, CourseUpdate
from app.services import courses as course_service

router = APIRouter(prefix="/api/courses", tags=["courses"])


def find_course(course_id: int, db: Session) -> Course:
    try:
        return course_service.get_course(db, course_id)
    except course_service.CourseNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        ) from error


def raise_conflict(error: course_service.CourseCodeConflictError) -> None:
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="A course with this code already exists",
    ) from error


@router.get("", response_model=list[CourseRead])
def list_courses(db: Session = Depends(get_db)) -> list[Course]:
    return course_service.list_courses(db)


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
def create_course(payload: CourseCreate, db: Session = Depends(get_db)) -> Course:
    try:
        return course_service.create_course(db, payload.model_dump())
    except course_service.CourseCodeConflictError as error:
        raise_conflict(error)


@router.get("/{course_id}", response_model=CourseRead)
def get_course(course_id: int, db: Session = Depends(get_db)) -> Course:
    return find_course(course_id, db)


@router.patch("/{course_id}", response_model=CourseRead)
def update_course(
    course_id: int,
    payload: CourseUpdate,
    db: Session = Depends(get_db),
) -> Course:
    try:
        return course_service.update_course(
            db,
            course_id,
            payload.model_dump(exclude_unset=True),
        )
    except course_service.CourseNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        ) from error
    except course_service.CourseCodeConflictError as error:
        raise_conflict(error)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(get_db)) -> Response:
    try:
        course_service.delete_course(db, course_id)
    except course_service.CourseNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        ) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
