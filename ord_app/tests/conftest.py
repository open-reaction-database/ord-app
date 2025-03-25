# Copyright 2024 Open Reaction Database Project Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import pytest
from alembic import command
from alembic.config import Config
from faker import Faker
from fastapi.testclient import TestClient
from ord_schema.proto.reaction_pb2 import Reaction
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import create_database, database_exists, drop_database

from ord_app.service_api.main import app
from ord_app.service_api.models import (
    BaseModel,
    DatasetModel,
    GroupModel,
    ReactionModel,
    TemplateModel,
    UserGroupsMembershipModel,
    UserModel,
)
from ord_app.service_api.services.auth0 import verify_access_token
from ord_app.service_api.services.postgresql import get_db_session
from ord_app.service_api.settings import RuntimeSettings

fake = Faker()

pg_engine = create_async_engine(RuntimeSettings.pg_test_dsn)
db_session_maker = async_sessionmaker(pg_engine, expire_on_commit=False, autocommit=False, autoflush=False)


async def _test_db_session():
    async with db_session_maker() as session:
        yield session


@pytest.fixture
async def test_db_session():
    async with db_session_maker() as session:
        yield session


async def mock_validate_reactions_task(*args, **kwargs):
    pass


@pytest.fixture(autouse=True)
def override_validate_reactions_task(monkeypatch):
    monkeypatch.setattr(
        "ord_app.service_api.resources.v1.datasets.validate_dataset_reactions",
        mock_validate_reactions_task
    )

@pytest.fixture(autouse=True)
async def override_engine(monkeypatch):
    monkeypatch.setattr("ord_app.service_api.services.postgresql.pg_engine", pg_engine)
    test_session_maker = async_sessionmaker(
        pg_engine, expire_on_commit=False, autoflush=False, autocommit=False
    )
    monkeypatch.setattr("ord_app.service_api.services.postgresql.db_session_maker", test_session_maker)

@pytest.fixture
def api_client():
    app.dependency_overrides[get_db_session] = _test_db_session
    yield TestClient(app)
    app.dependency_overrides = {}


@pytest.fixture(scope="session", autouse=True)
def create_test_database():
    engine = create_engine(RuntimeSettings.pg_test_dsn)
    if not database_exists(engine.url):
        create_database(engine.url)
    engine.dispose()

    alembic_cfg = Config(str(RuntimeSettings.base_dir.parent.parent / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(RuntimeSettings.base_dir.parent.parent / "migrations"))
    alembic_cfg.set_main_option("sqlalchemy.url", RuntimeSettings.pg_test_dsn)
    command.upgrade(alembic_cfg, "head")

    yield

    drop_database(RuntimeSettings.pg_test_dsn)


@pytest.fixture(autouse=True)
def clear_database():
    engine = create_engine(RuntimeSettings.pg_test_dsn)
    db_session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    with db_session() as session:
        for table in reversed(BaseModel.metadata.sorted_tables):
            session.execute(text(f'TRUNCATE TABLE "{table.name}" CASCADE;'))
        session.commit()

    engine.dispose()

    yield


@pytest.fixture
async def test_user(test_db_session):
    user = UserModel(email="utest@unit.com", external_id="utest_external_id", auth0_id="utest_auth0_id")
    test_db_session.add(user)
    await test_db_session.commit()
    await test_db_session.refresh(user)
    return user


@pytest.fixture
async def mock_authenticated_user(test_db_session):
    user = UserModel(
        name=fake.name(),
        email=fake.email(),
        external_id=fake.uuid4(),
        auth0_id=fake.uuid4(),
        orcid_id=fake.uuid4(),
    )
    group = GroupModel(name="utest", owner_id=user.id)
    group_member = UserGroupsMembershipModel(user=user, group=group, role="admin")
    test_db_session.add_all([user, group, group_member])

    await test_db_session.commit()
    await test_db_session.refresh(user)

    def set_mock_user(new_user):
        nonlocal user
        user = new_user
        app.dependency_overrides[verify_access_token] = lambda: {"sub": user.auth0_id}

    app.dependency_overrides[verify_access_token] = lambda: {"sub": user.auth0_id}

    yield user, set_mock_user, group

    app.dependency_overrides.pop(verify_access_token, None)


async def create_test_dataset(db_session, mock_authenticated_user) -> DatasetModel:
    user, _, group = mock_authenticated_user
    dataset = DatasetModel(owner=user, groups=[group], name=fake.uuid4())
    db_session.add(dataset)
    await db_session.commit()
    return dataset


async def create_test_reaction(
    db_session,
    mock_authenticated_user,
    dataset,
    pb_reaction=None,
    is_valid=None
) -> ReactionModel:
    pb_reaction = pb_reaction or Reaction(reaction_id=fake.uuid4())
    user, _, group = mock_authenticated_user
    reaction = ReactionModel(
        pb_reaction_id=pb_reaction.reaction_id,
        dataset=dataset,
        owner=user,
        binpb=pb_reaction.SerializeToString(),
        is_valid=is_valid
    )
    db_session.add(reaction)
    await db_session.commit()
    return reaction


async def create_test_user_with_group(test_db_session, role="admin"):
    user = UserModel(
        email=fake.email(),
        external_id=str(fake.uuid4()),
        auth0_id=str(fake.uuid4()),
        orcid_id=str(fake.uuid4()),
    )
    group = GroupModel(name=fake.word(), owner=user)
    group_member = UserGroupsMembershipModel(
        user=user,
        group=group,
        role=role
    )
    test_db_session.add_all([user, group, group_member])
    await test_db_session.commit()
    await test_db_session.refresh(user)
    return user, group


async def create_template(test_db_session, user_id):
    payload = {
        "binpb": Reaction(reaction_id=fake.name()).SerializeToString(),
        "name": fake.name(),
        "variables": fake.json(),
        "owner_id": user_id,
    }
    template = TemplateModel(**payload)
    test_db_session.add(template)
    await test_db_session.commit()
    await test_db_session.refresh(template)
    return template
