"""Create the assignments table.

Revision ID: 20260720_03
Revises: 20260720_02
Create Date: 2026-07-20
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260720_03"
down_revision: str | None = "20260720_02"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "assignments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_assignments_course_id"), "assignments", ["course_id"])
    op.create_index(op.f("ix_assignments_due_date"), "assignments", ["due_date"])


def downgrade() -> None:
    op.drop_index(op.f("ix_assignments_due_date"), table_name="assignments")
    op.drop_index(op.f("ix_assignments_course_id"), table_name="assignments")
    op.drop_table("assignments")
