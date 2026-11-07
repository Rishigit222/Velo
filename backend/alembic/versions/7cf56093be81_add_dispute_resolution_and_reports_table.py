"""add_dispute_resolution_and_reports_table

Revision ID: 7cf56093be81
Revises: 4ae18077fa6b
Create Date: 2026-11-07 18:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7cf56093be81'
down_revision: Union[str, Sequence[str], None] = '4ae18077fa6b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema safely."""
    # 1. Add resolution_details to disputes
    with op.batch_alter_table('disputes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('resolution_details', sa.Text(), nullable=True))

    # 2. Create reports table
    op.create_table(
        'reports',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('generated_by', sa.Integer(), nullable=True),
        sa.Column('report_type', sa.String(length=50), server_default='evidence_dossier', nullable=False),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('file_size', sa.Integer(), server_default='0', nullable=False),
        sa.Column('file_hash', sa.String(length=64), nullable=False),
        sa.Column('version', sa.String(length=20), server_default='1.0', nullable=False),
        sa.Column('status', sa.String(length=50), server_default='ready', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.ForeignKeyConstraint(['generated_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('reports', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_reports_id'), ['id'], unique=False)
        batch_op.create_index(batch_op.f('ix_reports_order_id'), ['order_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_reports_generated_by'), ['generated_by'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('reports', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_reports_generated_by'))
        batch_op.drop_index(batch_op.f('ix_reports_order_id'))
        batch_op.drop_index(batch_op.f('ix_reports_id'))
    op.drop_table('reports')

    with op.batch_alter_table('disputes', schema=None) as batch_op:
        batch_op.drop_column('resolution_details')
