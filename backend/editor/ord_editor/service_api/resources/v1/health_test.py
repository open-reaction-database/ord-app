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
from fastapi.testclient import TestClient

from ord_editor.service_api.domain.auth import authenticate
from ord_editor.service_api.main import app
from ord_editor.service_api.services.postgresql import get_db_session


def _unavailable() -> None:
    raise RuntimeError("unavailable")


def test_health_answers_without_the_database_or_a_login(monkeypatch):
    for dependency in (get_db_session, authenticate):
        monkeypatch.setitem(app.dependency_overrides, dependency, _unavailable)
    # Outside a `with` block, the client runs neither the lifespan nor its database task.
    client = TestClient(app, raise_server_exceptions=False)

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    # A route that reads the login fails with the same overrides.
    assert client.get("/api/v1/users/me").status_code == 500
