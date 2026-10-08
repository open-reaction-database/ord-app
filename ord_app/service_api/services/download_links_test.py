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
from pydantic import SecretStr

from ord_app.service_api.constants import AppEnvs
from ord_app.service_api.services.download_links import (
    DOWNLOAD_LINK_LIFETIME,
    DownloadLink,
    InvalidDownloadLinkError,
    download_link_key,
    sign_download_link,
    verify_download_link,
)
from ord_app.service_api.settings import RuntimeSettings

NOW = 1_800_000_000
EXPIRES = NOW + DOWNLOAD_LINK_LIFETIME


def test_verify_returns_what_the_token_names():
    token = sign_download_link(4, "json", 7, now=NOW)

    assert token.startswith(f"4.json.7.{EXPIRES}.")
    assert verify_download_link(token, now=NOW) == DownloadLink(
        dataset_id=4, file_format="json", user_id=7
    )


def test_token_expires_after_its_lifetime():
    token = sign_download_link(4, "json", 7, now=NOW)

    verify_download_link(token, now=EXPIRES - 1)
    with pytest.raises(InvalidDownloadLinkError, match="Expired"):
        verify_download_link(token, now=EXPIRES)


@pytest.mark.parametrize(
    "payload",
    [
        f"5.json.7.{EXPIRES}",  # another dataset
        f"4.parquet.7.{EXPIRES}",  # another format
        f"4.json.8.{EXPIRES}",  # another user
        f"4.json.7.{EXPIRES + 3600}",  # a later expiry
    ],
)
def test_signature_covers_every_field(payload):
    signature = sign_download_link(4, "json", 7, now=NOW).rpartition(".")[2]

    with pytest.raises(InvalidDownloadLinkError, match="Signature"):
        verify_download_link(f"{payload}.{signature}", now=NOW)


@pytest.mark.parametrize(
    "token", ["", "4.json.7", f"4.json.7.{EXPIRES}.", f"4.json.7.{EXPIRES}.ünïcode"]
)
def test_rejects_a_malformed_token(token):
    with pytest.raises(InvalidDownloadLinkError):
        verify_download_link(token, now=NOW)


def test_rejects_a_token_signed_with_another_key(monkeypatch):
    token = sign_download_link(4, "json", 7, now=NOW)
    monkeypatch.setattr(RuntimeSettings, "download_link_secret", SecretStr("other"))

    with pytest.raises(InvalidDownloadLinkError, match="Signature"):
        verify_download_link(token, now=NOW)


def test_key_is_required_outside_localhost(monkeypatch):
    monkeypatch.setattr(RuntimeSettings, "download_link_secret", SecretStr(""))
    monkeypatch.setattr(RuntimeSettings, "app_env", AppEnvs.production)

    with pytest.raises(RuntimeError, match="DOWNLOAD_LINK_SECRET"):
        download_link_key()


def test_localhost_signs_without_a_configured_key(monkeypatch):
    monkeypatch.setattr(RuntimeSettings, "download_link_secret", SecretStr(""))
    monkeypatch.setattr(RuntimeSettings, "app_env", AppEnvs.localhost)

    token = sign_download_link(4, "json", 7, now=NOW)

    assert verify_download_link(token, now=NOW).dataset_id == 4
