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
from pathlib import PosixPath

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from ord_app.service_api.constants import AppEnvs


class Settings(BaseSettings):
    base_dir: PosixPath = PosixPath(__file__).parent
    model_config = SettingsConfigDict(env_file=str(base_dir.parent / ".env"), case_sensitive=False)

    # app
    app_env: str = AppEnvs.production
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])

    # databases
    pg_dsn: str = "postgresql+asyncpg://ord@localhost:5400/ord"  # NOSONAR
    # Alembic can't work with asynchronous driver
    pg_alembic_dsn: str = "postgresql+psycopg://ord@localhost:5400/ord"  # NOSONAR
    pg_test_dsn: str = "postgresql+psycopg://ord@localhost:5400/test"  # NOSONAR

    # Encryption and auth
    auth0_domain: str = Field("", validation_alias="vite_auth0_domain")
    auth0_algorithms: str = Field("RS256", validation_alias="vite_auth0_algorithms")
    auth0_audience: str = Field("", validation_alias="vite_auth0_audience")
    auth0_issuer: str = Field("", validation_alias="vite_auth0_issuer")
    auth0_client_id: str = Field("", validation_alias="vite_auth0_client_id")


RuntimeSettings = Settings()
