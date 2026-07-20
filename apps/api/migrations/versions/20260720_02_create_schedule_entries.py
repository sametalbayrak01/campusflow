"""Create the weekly schedule entries table.

Revision ID: 20260720_02
Revises: 20260720_01
Create Date: 2026-07-20
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260720_02"
down_revision: str | None = "20260720_01"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "schedule_entries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("weekday", sa.Integer(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("room", sa.String(length=50), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "start_time < end_time",
            name="ck_schedule_entries_time_range",
        ),
        sa.CheckConstraint(
            "weekday >= 0 AND weekday <= 6",
            name="ck_schedule_entries_weekday",
        ),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_schedule_entries_course_id"),
        "schedule_entries",
        ["course_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_schedule_entries_weekday"),
        "schedule_entries",
        ["weekday"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_schedule_entries_weekday"), table_name="schedule_entries")
    op.drop_index(op.f("ix_schedule_entries_course_id"), table_name="schedule_entries")
    op.drop_table("schedule_entries")
