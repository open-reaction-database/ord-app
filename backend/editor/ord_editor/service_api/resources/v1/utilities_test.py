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
"""Tests for ord_editor.service_api.resources.v1.utilities."""

import pytest
from ord_schema.proto.reaction_pb2 import Compound

CANONICALIZE_URL = "/api/v1/canonicalize-smiles"
GET_MOLBLOCK_URL = "/api/v1/get_molblock"
RACEMIC_ALANINE = "C[C@H](N)C(=O)O |&1:1|"


@pytest.mark.parametrize(
    ("smiles", "expected"),
    [
        ("OCC", "CCO"),
        (RACEMIC_ALANINE, RACEMIC_ALANINE),
    ],
)
def test_canonicalize_smiles_keeps_enhanced_stereo(api_client, smiles, expected):
    response = api_client.get(CANONICALIZE_URL, params={"smiles": smiles})
    assert response.status_code == 200
    assert response.json() == expected


def test_canonicalize_smiles_rejects_garbage(api_client):
    response = api_client.get(CANONICALIZE_URL, params={"smiles": "not-a-molecule"})
    assert response.status_code == 400


def test_get_molblock_draws_a_cxsmiles_only_compound(api_client):
    compound = Compound()
    compound.identifiers.add(type="CXSMILES", value=RACEMIC_ALANINE)
    response = api_client.post(GET_MOLBLOCK_URL, content=compound.SerializeToString())
    assert response.status_code == 200
    # V3000 is the molblock format that can hold the stereo group.
    assert "V3000" in response.json()
    assert "STERAC" in response.json()
