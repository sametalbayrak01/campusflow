from datetime import date, datetime, time
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class ExamBase(BaseModel):
    course_id: int = Field(gt=0)
    title: str = Field(min_length=2, max_length=160)
    exam_date: date
    start_time: time | None = None
    location: str | None = Field(default=None, max_length=80)

    @field_validator("title", mode="before")
    @classmethod
    def normalize_title(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("location", mode="before")
    @classmethod
    def normalize_location(cls, value: object) -> object:
        return value.strip() or None if isinstance(value, str) else value


class ExamCreate(ExamBase):
    pass


class ExamUpdate(BaseModel):
    course_id: int | None = Field(default=None, gt=0)
    title: str | None = Field(default=None, min_length=2, max_length=160)
    exam_date: date | None = None
    start_time: time | None = None
    location: str | None = Field(default=None, max_length=80)

    @field_validator("course_id", "title", "exam_date", mode="before")
    @classmethod
    def reject_null_required(cls, value: object) -> object:
        if value is None:
            raise ValueError("field cannot be null")
        return value

    @field_validator("title", mode="before")
    @classmethod
    def normalize_title(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("location", mode="before")
    @classmethod
    def normalize_location(cls, value: object) -> object:
        return value.strip() or None if isinstance(value, str) else value

    @model_validator(mode="after")
    def require_change(self) -> Self:
        if not self.model_fields_set:
            raise ValueError("at least one field must be provided")
        return self


class ExamCourseRead(BaseModel):
    id: int
    code: str
    name: str
    color: str
    model_config = ConfigDict(from_attributes=True)


class ExamRead(ExamBase):
    id: int
    created_at: datetime
    course: ExamCourseRead
    model_config = ConfigDict(from_attributes=True)
