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
"""Short-lived tokens that let a browser download a dataset without a bearer token.

A token names a dataset, a format, the user it was made for, and when it expires, and
carries an HMAC-SHA256 over all four. It can be used any number of times until then.
"""

import base64
import hashlib
import hmac
import time
from dataclasses import dataclass
from typing import cast

from ord_app.service_api.constants import AppEnvs
from ord_app.service_api.schemas.datasets import DatasetDownloadFileFormats
from ord_app.service_api.settings import RuntimeSettings

# Seconds a token stays valid. The browser uses it as soon as it is made, and only the
# start of a download is checked.
DOWNLOAD_LINK_LIFETIME = 30

# Signs tokens when app_env is localhost and download_link_secret is unset.
_LOCALHOST_KEY = b"ord-app localhost download links"
# Prefixed to every signed payload, so these signatures differ from any other HMAC that
# uses the same key.
_CONTEXT = b"ord-app download link\0"


class InvalidDownloadLinkError(ValueError):
    """Raised for a token that is malformed, wrongly signed, or expired."""


@dataclass(frozen=True)
class DownloadLink:
    """What a verified token grants."""

    dataset_id: int
    file_format: DatasetDownloadFileFormats
    user_id: int


def download_link_key() -> bytes:
    """Returns the key that signs download tokens.

    Raises:
        RuntimeError: If ``download_link_secret`` is unset and ``app_env`` is not
            localhost.
    """
    secret = RuntimeSettings.download_link_secret.get_secret_value()
    if secret:
        return secret.encode()
    if RuntimeSettings.app_env.lower() == AppEnvs.localhost:
        return _LOCALHOST_KEY
    raise RuntimeError("DOWNLOAD_LINK_SECRET is required unless APP_ENV is localhost")


def _signature(payload: str) -> bytes:
    """Returns the unpadded base64url HMAC-SHA256 of ``payload``."""
    digest = hmac.new(
        download_link_key(), _CONTEXT + payload.encode(), hashlib.sha256
    ).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=")


def sign_download_link(
    dataset_id: int,
    file_format: DatasetDownloadFileFormats,
    user_id: int,
    *,
    now: float | None = None,
) -> str:
    """Returns a token for one user to download one dataset in one format.

    Args:
        dataset_id: The dataset to download.
        file_format: ``binpb``, ``json``, ``txtpb``, or ``parquet``.
        user_id: The user the token is made for; access is checked again on use.
        now: Unix time in seconds that the lifetime counts from; defaults to the clock.

    Returns:
        ``<dataset_id>.<file_format>.<user_id>.<expiry>.<signature>``, which needs no
        escaping in a URL path segment.
    """
    expires = int(time.time() if now is None else now) + DOWNLOAD_LINK_LIFETIME
    payload = f"{dataset_id}.{file_format}.{user_id}.{expires}"
    return f"{payload}.{_signature(payload).decode()}"


def verify_download_link(token: str, *, now: float | None = None) -> DownloadLink:
    """Returns what a token grants, after checking its signature and expiry.

    Args:
        token: A token from ``sign_download_link``.
        now: Unix time in seconds to check the expiry against; defaults to the clock.

    Returns:
        The dataset, format, and user that the token names.

    Raises:
        InvalidDownloadLinkError: If the token is malformed, its signature does not
            match, or it has expired.
    """
    payload, _, signature = token.rpartition(".")
    if not hmac.compare_digest(signature.encode(), _signature(payload)):
        raise InvalidDownloadLinkError("Signature does not match")
    # Only this module signs payloads, so a valid signature means a well-formed payload.
    dataset_id, file_format, user_id, expires = payload.split(".")
    if (time.time() if now is None else now) >= int(expires):
        raise InvalidDownloadLinkError("Expired")
    return DownloadLink(
        dataset_id=int(dataset_id),
        file_format=cast(DatasetDownloadFileFormats, file_format),
        user_id=int(user_id),
    )
