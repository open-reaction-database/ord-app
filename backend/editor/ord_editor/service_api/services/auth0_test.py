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

import hmac
import json
from collections.abc import Callable

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.asymmetric.padding import PKCS1v15
from cryptography.hazmat.primitives.hashes import SHA256
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
from fastapi.security import HTTPAuthorizationCredentials
from jwt.algorithms import RSAAlgorithm
from jwt.utils import base64url_encode

from ord_editor.service_api.services import auth0
from ord_editor.service_api.services.exceptions import ForbiddenError
from ord_editor.service_api.settings import RuntimeSettings

AUDIENCE = "https://editor.test/api"
ISSUER = "https://tenant.test/"
CLAIMS = {"sub": "auth0|someone", "aud": AUDIENCE, "iss": ISSUER}


def _rsa_key() -> rsa.RSAPrivateKey:
    return rsa.generate_private_key(public_exponent=65537, key_size=2048)


def _signed_by(key: rsa.RSAPrivateKey) -> HTTPAuthorizationCredentials:
    token = jwt.encode(CLAIMS, key, algorithm="RS256", headers={"kid": "test"})
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def _forged(alg: str, sign: Callable[[bytes], bytes]) -> HTTPAuthorizationCredentials:
    """Build a token whose header names ``alg``, signed by ``sign``.

    PyJWT refuses to sign with an unregistered algorithm, or with a PEM key as an HMAC
    secret, so the token is assembled by hand.
    """
    header = {"alg": alg, "typ": "JWT", "kid": "test"}
    signing_input = b".".join(
        base64url_encode(json.dumps(part).encode()) for part in (header, CLAIMS)
    )
    token = b".".join([signing_input, base64url_encode(sign(signing_input))])
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token.decode())


@pytest.fixture
def tenant_key(monkeypatch) -> rsa.RSAPrivateKey:
    """Serve one key's public half as the tenant's signing key, as its JWKS would."""
    key = _rsa_key()
    public = jwt.PyJWK.from_json(RSAAlgorithm.to_jwk(key.public_key()))
    monkeypatch.setattr(
        auth0.jwks_client, "get_signing_key_from_jwt", lambda token: public
    )
    return key


@pytest.fixture(
    params=[auth0.verify_access_token, auth0.verify_id_token],
    ids=["access_token", "id_token"],
)
def verify(request, monkeypatch):
    """Configure the tenant's settings and return one of the two token verifiers."""
    monkeypatch.setattr(RuntimeSettings, "e2e", False)
    monkeypatch.setattr(RuntimeSettings, "auth0_algorithms", "RS256")
    monkeypatch.setattr(RuntimeSettings, "auth0_audience", AUDIENCE)
    monkeypatch.setattr(RuntimeSettings, "auth0_client_id", AUDIENCE)
    monkeypatch.setattr(RuntimeSettings, "auth0_issuer", ISSUER)
    return request.param


async def test_verifies_a_token_the_tenant_signed(tenant_key, verify):
    payload = await verify(_signed_by(tenant_key))
    assert payload["sub"] == "auth0|someone"


async def test_refuses_a_token_another_key_signed(tenant_key, verify):
    with pytest.raises(ForbiddenError, match="Signature verification failed"):
        await verify(_signed_by(_rsa_key()))


async def test_refuses_the_public_key_as_an_hmac_secret(tenant_key, verify):
    pem = tenant_key.public_key().public_bytes(
        Encoding.PEM, PublicFormat.SubjectPublicKeyInfo
    )
    token = _forged(
        "HS256", lambda signing_input: hmac.digest(pem, signing_input, "sha256")
    )
    with pytest.raises(ForbiddenError, match="The specified alg value is not allowed"):
        await verify(token)


@pytest.mark.parametrize("alg", ["RS", "RS2", "S256"])
async def test_refuses_an_algorithm_named_by_part_of_the_allowed_one(
    tenant_key, verify, alg
):
    token = _forged(
        alg, lambda signing_input: tenant_key.sign(signing_input, PKCS1v15(), SHA256())
    )
    with pytest.raises(ForbiddenError, match="The specified alg value is not allowed"):
        await verify(token)
