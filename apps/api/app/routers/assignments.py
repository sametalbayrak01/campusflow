from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.assignment import Assignment
from app.schemas.assignment import AssignmentCreate, AssignmentRead, AssignmentUpdate
from app.services import assignments as assignment_service

router = APIRouter(prefix="/api/assignments", tags=["assignments"])


def course_not_found(error: assignment_service.AssignmentCourseNotFoundError) -> None:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Course not found",
    ) from error


@router.get("", response_model=list[AssignmentRead])
def list_assignments(db: Session = Depends(get_db)) -> list[Assignment]:
    return assignment_service.list_assignments(db)


@router.post("", response_model=AssignmentRead, status_code=status.HTTP_201_CREATED)
def create_assignment(
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
) -> Assignment:
    try:
        return assignment_service.create_assignment(db, payload.model_dump())
    except assignment_service.AssignmentCourseNotFoundError as error:
        course_not_found(error)


@router.patch("/{assignment_id}", response_model=AssignmentRead)
def update_assignment(
    assignment_id: int,
    payload: AssignmentUpdate,
    db: Session = Depends(get_db),
) -> Assignment:
    try:
        return assignment_service.update_assignment(
            db,
            assignment_id,
            payload.model_dump(exclude_unset=True),
        )
    except assignment_service.AssignmentNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found",
        ) from error
    except assignment_service.AssignmentCourseNotFoundError as error:
        course_not_found(error)


@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(assignment_id: int, db: Session = Depends(get_db)) -> Response:
    try:
        assignment_service.delete_assignment(db, assignment_id)
    except assignment_service.AssignmentNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found",
        ) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
