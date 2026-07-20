"""Create exams table."""

from collections.abc import Sequence
from alembic import op
import sqlalchemy as sa

revision: str = "20260720_04"
down_revision: str | None = "20260720_03"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "exams",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(160), nullable=False),
        sa.Column("exam_date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=True),
        sa.Column("location", sa.String(80), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False
        ),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_exams_course_id"), "exams", ["course_id"])
    op.create_index(op.f("ix_exams_exam_date"), "exams", ["exam_date"])


def downgrade() -> None:
    op.drop_index(op.f("ix_exams_exam_date"), table_name="exams")
    op.drop_index(op.f("ix_exams_course_id"), table_name="exams")
    op.drop_table("exams")
