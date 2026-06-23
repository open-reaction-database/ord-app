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
"""Tests for the compound-resolution endpoint, focused on identifier-type routing (#465)."""

from fastapi import status

from ord_app.service_api.resources.v1 import utilities


def test_resolve_compound_smiles_canonicalizes_locally(
    api_client, mock_authenticated_user, monkeypatch
):
    # A SMILES is already a structure: canonicalize locally, never hit the remote resolvers.
    remote_calls = []

    async def fake_remote(value_type, identifier):
        remote_calls.append((value_type, identifier))
        return ("PubChem API", "unused")

    monkeypatch.setattr(utilities, "name_resolve_cached", fake_remote)
    monkeypatch.setattr(
        utilities, "canonicalize_smiles_cached", lambda smiles: f"canon:{smiles}"
    )

    response = api_client.post(
        "/api/v1/resolve-compound",
        json={"identifier_type": "smiles", "identifier": "C(C)O"},
    ).raise_for_status()

    assert response.json() == {"smiles": "canon:C(C)O", "resolver": "RDKit"}
    assert remote_calls == []  # no remote lookup for a SMILES


def test_resolve_compound_threads_identifier_type(
    api_client, mock_authenticated_user, monkeypatch
):
    # Non-SMILES types (name/InChI) go to the remote resolvers with the type passed through.
    remote_calls = []

    async def fake_remote(value_type, identifier):
        remote_calls.append((value_type, identifier))
        return ("PubChem API", "O")

    monkeypatch.setattr(utilities, "name_resolve_cached", fake_remote)
    monkeypatch.setattr(utilities, "canonicalize_smiles_cached", lambda smiles: smiles)

    response = api_client.post(
        "/api/v1/resolve-compound",
        json={"identifier_type": "inchi", "identifier": "InChI=1S/H2O/h1H2"},
    ).raise_for_status()

    assert response.json() == {"smiles": "O", "resolver": "PubChem API"}
    assert remote_calls == [("inchi", "InChI=1S/H2O/h1H2")]


def test_resolve_compound_unresolvable_returns_400(
    api_client, mock_authenticated_user, monkeypatch
):
    # Every resolver failing yields None; surface a clean 400 rather than a 500 from unpacking None.
    async def fake_remote(value_type, identifier):
        return None

    monkeypatch.setattr(utilities, "name_resolve_cached", fake_remote)

    response = api_client.post(
        "/api/v1/resolve-compound",
        json={"identifier_type": "name", "identifier": "nonexistent-compound"},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
