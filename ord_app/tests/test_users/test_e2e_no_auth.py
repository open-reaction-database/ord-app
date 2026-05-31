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

from ord_app.service_api.constants import AppEnvs
from ord_app.service_api.services.auth0 import e2e_auth_enabled
from ord_app.service_api.settings import RuntimeSettings

JIT_URL = "/api/v1/auth/jit-provisioning"
ME_URL = "/api/v1/users/me"
E2E_EMAIL = "e2e@example.com"


@pytest.fixture
def e2e_mode(monkeypatch):
    monkeypatch.setattr(RuntimeSettings, "app_env", AppEnvs.localhost)
    monkeypatch.setattr(RuntimeSettings, "e2e", True)


def test_jit_provisioning_creates_dev_user_without_real_token(api_client, e2e_mode):
    response = api_client.post(JIT_URL, json={"access_token": "dev", "id_token": "dev"})

    assert response.status_code == 201
    assert response.json()["email"] == E2E_EMAIL


def test_jit_provisioning_is_idempotent(api_client, e2e_mode):
    first = api_client.post(JIT_URL, json={"access_token": "dev", "id_token": "dev"}).raise_for_status().json()
    second = api_client.post(JIT_URL, json={"access_token": "dev", "id_token": "dev"}).raise_for_status().json()

    assert first["id"] == second["id"]


def test_authenticate_resolves_to_dev_user(api_client, e2e_mode):
    api_client.post(JIT_URL, json={"access_token": "dev", "id_token": "dev"}).raise_for_status()

    response = api_client.get(ME_URL, headers={"Authorization": "Bearer dev"})

    assert response.status_code == 200
    assert response.json()["email"] == E2E_EMAIL


@pytest.mark.parametrize("app_env", ["production", "Production", "PRODUCTION", "staging", ""])
def test_bypass_is_disabled_outside_localhost(monkeypatch, app_env):
    # The bypass is allowlisted to localhost, so even with e2e set it stays off everywhere else
    # (including case variants of "production" and any unknown environment).
    monkeypatch.setattr(RuntimeSettings, "app_env", app_env)
    monkeypatch.setattr(RuntimeSettings, "e2e", True)

    assert e2e_auth_enabled() is False


def test_bypass_requires_the_flag(monkeypatch):
    monkeypatch.setattr(RuntimeSettings, "app_env", AppEnvs.localhost)
    monkeypatch.setattr(RuntimeSettings, "e2e", False)

    assert e2e_auth_enabled() is False
