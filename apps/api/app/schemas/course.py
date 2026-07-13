from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CourseBase(BaseModel):
    code: str = Field(min_length=2, max_length=20)
    name: str = Field(min_length=2, max_length=120)
    instructor: str | None = Field(default=None, max_length=100)
    room: str | None = Field(default=None, max_length=50)
    color: str = Field(default="#6853d7", pattern=r"^#[0-9a-fA-F]{6}$")
    credits: int = Field(default=3, ge=1, le=30)

    @field_validator("code")
    @classmethod
    def normalize_code(cls, value: str) -> str:
        return value.strip().upper()

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        return value.strip()


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=2, max_length=20)
    name: str | None = Field(default=None, min_length=2, max_length=120)
    instructor: str | None = Field(default=None, max_length=100)
    room: str | None = Field(default=None, max_length=50)
    color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")
    credits: int | None = Field(default=None, ge=1, le=30)

    @field_validator("code")
    @classmethod
    def normalize_code(cls, value: str | None) -> str | None:
        return value.strip().upper() if value is not None else None


class CourseRead(CourseBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
