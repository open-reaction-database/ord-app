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

from pydantic_settings import BaseSettings, SettingsConfigDict

from ord_app.service_api.constants import AppEns


class Settings(BaseSettings):
    base_dir: PosixPath = PosixPath(__file__).parent
    model_config = SettingsConfigDict(env_file=str(base_dir.parent / ".env"))

    # app
    app_env: str = AppEns.localhost
    cors_origins: list[str] = ["http://localhost:5173"]

    # databases
    pg_dsn: str = "postgresql+psycopg://ord@localhost:5400/ord"
    pg_test_dsn: str = "postgresql+psycopg://ord@localhost:5400/test"

    # Encryption and auth
    auth0_domain: str = ""
    auth0_algorithms: str = ""
    auth0_audience: str = ""
    auth0_issuer: str = ""
    auth0_client_id: str = ""


RuntimeSettings = Settings()
