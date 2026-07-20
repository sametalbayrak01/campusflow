from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

from app.config import get_settings


def test_migrations_create_course_schema(tmp_path: Path, monkeypatch) -> None:
    database_path = tmp_path / "migration-test.db"
    database_url = f"sqlite:///{database_path.as_posix()}"
    monkeypatch.setenv("DATABASE_URL", database_url)
    get_settings.cache_clear()

    config = Config(str(Path(__file__).parents[1] / "alembic.ini"))
    try:
        command.upgrade(config, "head")

        inspector = inspect(create_engine(database_url))
        assert {"alembic_version", "assignments", "courses", "schedule_entries"} <= set(
            inspector.get_table_names()
        )
        assert {column["name"] for column in inspector.get_columns("courses")} == {
            "id",
            "code",
            "name",
            "instructor",
            "room",
            "color",
            "credits",
            "created_at",
        }
        assert any(index["unique"] for index in inspector.get_indexes("courses"))
        assert {column["name"] for column in inspector.get_columns("schedule_entries")} == {
            "id",
            "course_id",
            "weekday",
            "start_time",
            "end_time",
            "room",
            "created_at",
        }
        assert {column["name"] for column in inspector.get_columns("assignments")} == {
            "id",
            "course_id",
            "title",
            "due_date",
            "completed",
            "created_at",
        }
    finally:
        get_settings.cache_clear()
