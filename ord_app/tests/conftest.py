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
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import create_database, database_exists, drop_database

from ord_app.service_api.main import app
from ord_app.service_api.models import AuthProviders, BaseModel, UserModel
from ord_app.service_api.schemas.auth import OAuthJWTSchema
from ord_app.service_api.services.postgresql import get_db_session
from ord_app.service_api.settings import RuntimeSettings

test_fast_app = TestClient(app)
pg_engine = create_async_engine(RuntimeSettings.pg_test_dsn)
db_session_maker = async_sessionmaker(pg_engine, expire_on_commit=False, autocommit=False, autoflush=False)


async def _test_db_session():
    async with db_session_maker() as session:
        yield session


app.dependency_overrides[get_db_session] = _test_db_session


@pytest.fixture
async def test_db_session():
    async with db_session_maker() as session:
        yield session


@pytest.fixture
def api_client():
    return test_fast_app


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


# @pytest.fixture
# async def test_user(test_db_session) -> tuple[UserModel, str]:
#     user = UserModel(email="test@unit.com", password="password")
#     test_db_session.add(user)
#     await test_db_session.commit()
#     data = OAuthJWTSchema(sub=user.email or user.name, provider=AuthProviders.platform)
#     access_token = create_access_token(data=data)
#     return user, f"Bearer {access_token}"
