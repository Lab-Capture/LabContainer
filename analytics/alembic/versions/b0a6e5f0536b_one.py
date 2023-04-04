"""one

Revision ID: b0a6e5f0536b
Revises: 
Create Date: 2023-04-03 17:36:45.137114

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b0a6e5f0536b'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('labs',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('course', sa.String(), nullable=True),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('instructor', sa.String(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('deadline', sa.Date(), nullable=True),
    sa.Column('environment_init_script', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_labs_id'), 'labs', ['id'], unique=False)
    op.create_table('users',
    sa.Column('name', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('name')
    )
    op.create_index(op.f('ix_users_name'), 'users', ['name'], unique=False)
    op.create_table('association_user_lab',
    sa.Column('lab_id', sa.String(), nullable=True),
    sa.Column('user_name', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['lab_id'], ['labs.id'], ),
    sa.ForeignKeyConstraint(['user_name'], ['users.name'], )
    )
    op.create_table('milestone',
    sa.Column('milestone_id', sa.String(), nullable=False),
    sa.Column('lab_id', sa.String(), nullable=True),
    sa.Column('deadline', sa.Date(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('test_script', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['lab_id'], ['labs.id'], ),
    sa.PrimaryKeyConstraint('milestone_id')
    )
    op.create_index(op.f('ix_milestone_milestone_id'), 'milestone', ['milestone_id'], unique=False)
    op.create_table('teams',
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('lab_id', sa.String(), nullable=True),
    sa.Column('current_milestone', sa.String(), nullable=True),
    sa.Column('time_spent', sa.Integer(), nullable=True),
    sa.Column('submitted', sa.Boolean(), nullable=True),
    sa.ForeignKeyConstraint(['current_milestone'], ['milestone.milestone_id'], ),
    sa.ForeignKeyConstraint(['lab_id'], ['labs.id'], ),
    sa.PrimaryKeyConstraint('name')
    )
    op.create_index(op.f('ix_teams_name'), 'teams', ['name'], unique=False)
    op.create_table('association_user_team',
    sa.Column('team_name', sa.String(), nullable=True),
    sa.Column('user_name', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['team_name'], ['teams.name'], ),
    sa.ForeignKeyConstraint(['user_name'], ['users.name'], )
    )
    op.create_table('environment',
    sa.Column('env_id', sa.String(), nullable=False),
    sa.Column('url', sa.String(), nullable=True),
    sa.Column('image', sa.String(), nullable=True),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('team', sa.String(), nullable=True),
    sa.Column('user', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['team'], ['teams.name'], ),
    sa.ForeignKeyConstraint(['user'], ['users.name'], ),
    sa.PrimaryKeyConstraint('env_id')
    )
    op.create_index(op.f('ix_environment_env_id'), 'environment', ['env_id'], unique=False)
    op.create_index(op.f('ix_environment_url'), 'environment', ['url'], unique=False)
    op.create_table('messages',
    sa.Column('message_id', sa.String(), nullable=False),
    sa.Column('env_id', sa.String(), nullable=True),
    sa.Column('user', sa.String(), nullable=True),
    sa.Column('message', sa.String(), nullable=True),
    sa.Column('timestamp', sa.Date(), nullable=True),
    sa.ForeignKeyConstraint(['env_id'], ['environment.env_id'], ),
    sa.ForeignKeyConstraint(['user'], ['users.name'], ),
    sa.PrimaryKeyConstraint('message_id')
    )
    op.create_index(op.f('ix_messages_message_id'), 'messages', ['message_id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_messages_message_id'), table_name='messages')
    op.drop_table('messages')
    op.drop_index(op.f('ix_environment_url'), table_name='environment')
    op.drop_index(op.f('ix_environment_env_id'), table_name='environment')
    op.drop_table('environment')
    op.drop_table('association_user_team')
    op.drop_index(op.f('ix_teams_name'), table_name='teams')
    op.drop_table('teams')
    op.drop_index(op.f('ix_milestone_milestone_id'), table_name='milestone')
    op.drop_table('milestone')
    op.drop_table('association_user_lab')
    op.drop_index(op.f('ix_users_name'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_labs_id'), table_name='labs')
    op.drop_table('labs')
    # ### end Alembic commands ###