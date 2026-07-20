from datetime import datetime, time
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class ScheduleEntryBase(BaseModel):
    course_id: int = Field(gt=0)
    weekday: int = Field(ge=0, le=6)
    start_time: time
    end_time: time
    room: str | None = Field(default=None, max_length=50)

    @field_validator("room", mode="before")
    @classmethod
    def normalize_room(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip() or None
        return value

    @model_validator(mode="after")
    def validate_time_range(self) -> Self:
        if self.start_time >= self.end_time:
            raise ValueError("end_time must be after start_time")
        return self


class ScheduleEntryCreate(ScheduleEntryBase):
    pass


class ScheduleEntryUpdate(BaseModel):
    course_id: int | None = Field(default=None, gt=0)
    weekday: int | None = Field(default=None, ge=0, le=6)
    start_time: time | None = None
    end_time: time | None = None
    room: str | None = Field(default=None, max_length=50)

    @field_validator("course_id", "weekday", "start_time", "end_time", mode="before")
    @classmethod
    def reject_null_required_fields(cls, value: object) -> object:
        if value is None:
            raise ValueError("field cannot be null")
        return value

    @field_validator("room", mode="before")
    @classmethod
    def normalize_room(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip() or None
        return value

    @model_validator(mode="after")
    def validate_update(self) -> Self:
        if not self.model_fields_set:
            raise ValueError("at least one field must be provided")
        if (
            self.start_time is not None
            and self.end_time is not None
            and self.start_time >= self.end_time
        ):
            raise ValueError("end_time must be after start_time")
        return self


class ScheduleCourseRead(BaseModel):
    id: int
    code: str
    name: str
    color: str

    model_config = ConfigDict(from_attributes=True)


class ScheduleEntryRead(ScheduleEntryBase):
    id: int
    created_at: datetime
    course: ScheduleCourseRead

    model_config = ConfigDict(from_attributes=True)
