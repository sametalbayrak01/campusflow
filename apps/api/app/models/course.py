from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    instructor: Mapped[str | None] = mapped_column(String(100), nullable=True)
    room: Mapped[str | None] = mapped_column(String(50), nullable=True)
    color: Mapped[str] = mapped_column(String(7), default="#6853d7")
    credits: Mapped[int] = mapped_column(Integer, default=3)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
