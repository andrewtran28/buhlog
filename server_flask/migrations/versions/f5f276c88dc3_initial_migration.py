"""Initial migration

Revision ID: f5f276c88dc3
Revises: 
Create Date: 2025-04-10 13:51:59.386021

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'f5f276c88dc3'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('_prisma_migrations')
    with op.batch_alter_table('Session', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.TEXT(),
               type_=sa.String(),
               existing_nullable=False)
        batch_op.alter_column('sid',
               existing_type=sa.TEXT(),
               type_=sa.String(),
               existing_nullable=False)
        batch_op.alter_column('data',
               existing_type=sa.TEXT(),
               type_=sa.String(),
               existing_nullable=False)
        batch_op.drop_index('Session_sid_key')
        batch_op.create_unique_constraint(None, ['sid'])

    with op.batch_alter_table('comments', schema=None) as batch_op:
        batch_op.drop_constraint('comments_postId_fkey', type_='foreignkey')
        batch_op.drop_constraint('comments_userId_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'users', ['userId'], ['id'], ondelete='CASCADE')
        batch_op.create_foreign_key(None, 'posts', ['postId'], ['id'], ondelete='CASCADE')

    with op.batch_alter_table('posts', schema=None) as batch_op:
        batch_op.alter_column('title',
               existing_type=sa.TEXT(),
               type_=sa.String(),
               existing_nullable=False)
        batch_op.drop_index('posts_title_key')
        batch_op.create_unique_constraint(None, ['title'])
        batch_op.drop_constraint('posts_userId_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'users', ['userId'], ['id'])

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_index('users_username_key')
        batch_op.create_unique_constraint(None, ['username'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='unique')
        batch_op.create_index('users_username_key', ['username'], unique=True)

    with op.batch_alter_table('posts', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('posts_userId_fkey', 'users', ['userId'], ['id'], onupdate='CASCADE', ondelete='CASCADE')
        batch_op.drop_constraint(None, type_='unique')
        batch_op.create_index('posts_title_key', ['title'], unique=True)
        batch_op.alter_column('title',
               existing_type=sa.String(),
               type_=sa.TEXT(),
               existing_nullable=False)

    with op.batch_alter_table('comments', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('comments_userId_fkey', 'users', ['userId'], ['id'], onupdate='CASCADE', ondelete='CASCADE')
        batch_op.create_foreign_key('comments_postId_fkey', 'posts', ['postId'], ['id'], onupdate='CASCADE', ondelete='CASCADE')

    with op.batch_alter_table('Session', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='unique')
        batch_op.create_index('Session_sid_key', ['sid'], unique=True)
        batch_op.alter_column('data',
               existing_type=sa.String(),
               type_=sa.TEXT(),
               existing_nullable=False)
        batch_op.alter_column('sid',
               existing_type=sa.String(),
               type_=sa.TEXT(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.String(),
               type_=sa.TEXT(),
               existing_nullable=False)

    op.create_table('_prisma_migrations',
    sa.Column('id', sa.VARCHAR(length=36), autoincrement=False, nullable=False),
    sa.Column('checksum', sa.VARCHAR(length=64), autoincrement=False, nullable=False),
    sa.Column('finished_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.Column('migration_name', sa.VARCHAR(length=255), autoincrement=False, nullable=False),
    sa.Column('logs', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('rolled_back_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.Column('started_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.Column('applied_steps_count', sa.INTEGER(), server_default=sa.text('0'), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name='_prisma_migrations_pkey')
    )
    # ### end Alembic commands ###
