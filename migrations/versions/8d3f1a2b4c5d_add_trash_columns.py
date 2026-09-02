"""add trash columns

Revision ID: 8d3f1a2b4c5d
Revises: fdca65b9b209
Create Date: 2026-08-19
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "8d3f1a2b4c5d"
down_revision: str | None = "fdca65b9b209"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("dataset", sa.Column("deleted_at", sa.DateTime(), nullable=True))
    op.add_column("dataset", sa.Column("deleted_by_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_dataset_deleted_by_id_user",
        "dataset",
        "user",
        ["deleted_by_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.add_column("reaction", sa.Column("deleted_at", sa.DateTime(), nullable=True))
    op.add_column("reaction", sa.Column("deleted_by_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_reaction_deleted_by_id_user",
        "reaction",
        "user",
        ["deleted_by_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.drop_constraint(
        "uq_pb_reaction_id_dataset_id", "reaction", type_="unique"
    )
    op.create_index(
        "uq_live_pb_reaction_id_dataset_id",
        "reaction",
        ["pb_reaction_id", "dataset_id"],
        unique=True,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_index("uq_live_pb_reaction_id_dataset_id", table_name="reaction")
    # Live rows may reuse a trashed pb_reaction_id. Unconditional uniqueness
    # cannot be restored until trash rows are gone.
    op.execute("DELETE FROM reaction WHERE deleted_at IS NOT NULL")
    op.execute("DELETE FROM dataset WHERE deleted_at IS NOT NULL")
    op.create_unique_constraint(
        "uq_pb_reaction_id_dataset_id",
        "reaction",
        ["pb_reaction_id", "dataset_id"],
    )
    op.drop_constraint(
        "fk_reaction_deleted_by_id_user", "reaction", type_="foreignkey"
    )
    op.drop_column("reaction", "deleted_by_id")
    op.drop_column("reaction", "deleted_at")
    op.drop_constraint(
        "fk_dataset_deleted_by_id_user", "dataset", type_="foreignkey"
    )
    op.drop_column("dataset", "deleted_by_id")
    op.drop_column("dataset", "deleted_at")
