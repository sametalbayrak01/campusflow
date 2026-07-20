from datetime import date, datetime
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class AssignmentBase(BaseModel):
    course_id: int = Field(gt=0)
    title: str = Field(min_length=2, max_length=160)
    due_date: date
    completed: bool = False

    @field_validator("title", mode="before")
    @classmethod
    def normalize_title(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value


class AssignmentCreate(AssignmentBase):
    pass


class AssignmentUpdate(BaseModel):
    course_id: int | None = Field(default=None, gt=0)
    title: str | None = Field(default=None, min_length=2, max_length=160)
    due_date: date | None = None
    completed: bool | None = None

    @field_validator("course_id", "title", "due_date", "completed", mode="before")
    @classmethod
    def reject_null_fields(cls, value: object) -> object:
        if value is None:
            raise ValueError("field cannot be null")
        return value

    @field_validator("title", mode="before")
    @classmethod
    def normalize_title(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @model_validator(mode="after")
    def require_at_least_one_change(self) -> Self:
        if not self.model_fields_set:
            raise ValueError("at least one field must be provided")
        return self


class AssignmentCourseRead(BaseModel):
    id: int
    code: str
    name: str
    color: str

    model_config = ConfigDict(from_attributes=True)


class AssignmentRead(AssignmentBase):
    id: int
    created_at: datetime
    course: AssignmentCourseRead

    model_config = ConfigDict(from_attributes=True)
