from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.exam import Exam
from app.schemas.exam import ExamCreate, ExamRead, ExamUpdate
from app.services import exams as service

router = APIRouter(prefix="/api/exams", tags=["exams"])


@router.get("", response_model=list[ExamRead])
def list_exams(db: Session = Depends(get_db)) -> list[Exam]:
    return service.list_exams(db)


@router.post("", response_model=ExamRead, status_code=201)
def create_exam(payload: ExamCreate, db: Session = Depends(get_db)) -> Exam:
    try:
        return service.create_exam(db, payload.model_dump())
    except service.ExamCourseNotFoundError as error:
        raise HTTPException(status_code=404, detail="Course not found") from error


@router.patch("/{exam_id}", response_model=ExamRead)
def update_exam(exam_id: int, payload: ExamUpdate, db: Session = Depends(get_db)) -> Exam:
    try:
        return service.update_exam(db, exam_id, payload.model_dump(exclude_unset=True))
    except service.ExamNotFoundError as error:
        raise HTTPException(status_code=404, detail="Exam not found") from error
    except service.ExamCourseNotFoundError as error:
        raise HTTPException(status_code=404, detail="Course not found") from error


@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exam(exam_id: int, db: Session = Depends(get_db)) -> Response:
    try:
        service.delete_exam(db, exam_id)
    except service.ExamNotFoundError as error:
        raise HTTPException(status_code=404, detail="Exam not found") from error
    return Response(status_code=204)
