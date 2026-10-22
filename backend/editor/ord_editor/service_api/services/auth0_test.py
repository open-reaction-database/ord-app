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
"""Tests for verifying Auth0's RS256 tokens."""

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi.security import HTTPAuthorizationCredentials
from jwt.algorithms import RSAAlgorithm

from ord_editor.service_api.services import auth0
from ord_editor.service_api.services.exceptions import ForbiddenError

AUDIENCE = "https://editor.test/api"
ISSUER = "https://tenant.test/"


def _rsa_key() -> rsa.RSAPrivateKey:
    return rsa.generate_private_key(public_exponent=65537, key_size=2048)


def _signed_by(key: rsa.RSAPrivateKey) -> HTTPAuthorizationCredentials:
    token = jwt.encode(
        {"sub": "auth0|someone", "aud": AUDIENCE, "iss": ISSUER},
        key,
        algorithm="RS256",
        headers={"kid": "test"},
    )
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


@pytest.fixture
def tenant_key(monkeypatch) -> rsa.RSAPrivateKey:
    """Serve one key's public half as the tenant's signing key, as its JWKS would."""
    key = _rsa_key()
    public = jwt.PyJWK.from_json(RSAAlgorithm.to_jwk(key.public_key()))
    monkeypatch.setattr(
        auth0.jwks_client, "get_signing_key_from_jwt", lambda token: public
    )
    return key


async def test_verifies_a_token_the_tenant_signed(tenant_key):
    payload = await auth0._verify_token(
        _signed_by(tenant_key), algorithms="RS256", audience=AUDIENCE, issuer=ISSUER
    )
    assert payload["sub"] == "auth0|someone"


async def test_refuses_a_token_another_key_signed(tenant_key):
    token = _signed_by(_rsa_key())
    with pytest.raises(ForbiddenError, match="Signature verification failed"):
        await auth0._verify_token(
            token, algorithms="RS256", audience=AUDIENCE, issuer=ISSUER
        )
