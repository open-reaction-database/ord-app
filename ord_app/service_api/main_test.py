# Copyright 2026 Open Reaction Database Project Authors
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
from fastapi.testclient import TestClient
from pydantic import SecretStr

from ord_app.service_api.constants import AppEnvs
from ord_app.service_api.main import app
from ord_app.service_api.settings import RuntimeSettings


def test_startup_fails_without_a_download_link_key(monkeypatch):
    monkeypatch.setattr(RuntimeSettings, "download_link_secret", SecretStr(""))
    monkeypatch.setattr(RuntimeSettings, "app_env", AppEnvs.production)

    # Entering the client runs the app's lifespan, which checks the key first.
    with pytest.raises(RuntimeError, match="DOWNLOAD_LINK_SECRET"), TestClient(app):
        pass
