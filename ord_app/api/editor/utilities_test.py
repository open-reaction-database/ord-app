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

"""Tests for ord_app.api.editor.utilities."""
import os
from base64 import b64decode

import pytest
from ord_schema.proto.dataset_pb2 import Dataset
from ord_schema.proto.reaction_pb2 import Percentage, ReactionInput

from ord_app.api.testing import TEST_USER_ID


@pytest.mark.parametrize(
    "message,expected_num_errors,expected_num_warnings",
    ((Percentage(value=15.6), 0, 0), (Percentage(precision=-15.6), 2, 0)),
)
def test_validate(test_client, message, expected_num_errors, expected_num_warnings):
    response = test_client.post(f"/api/editor/validate/{message.DESCRIPTOR.name}", data=message.SerializeToString())
    response.raise_for_status()
    output = response.json()
    assert len(output["errors"]) == expected_num_errors
    assert len(output["warnings"]) == expected_num_warnings


def test_resolve_input(test_client):
    response = test_client.get(
        f"/api/editor/resolve_input", params={"input_string": "100 mL of 5.0uM sodium hydroxide in water"}
    )
    response.raise_for_status()
    reaction_input = ReactionInput.FromString(b64decode(response.json()))
    assert reaction_input.components[0].identifiers[0].value == "sodium hydroxide"


@pytest.mark.parametrize("identifier_type,data,expected", (("NAME", "benzene", "c1ccccc1"),))
def test_resolve_compound(test_client, identifier_type, data, expected):
    response = test_client.post(
        f"/api/editor/resolve_compound", json={"identifier_type": identifier_type, "identifier": data}
    )
    response.raise_for_status()
    assert response.json()["smiles"] == expected


@pytest.mark.parametrize("smiles,expected", (("C1=CC=CC=C1", "c1ccccc1"),))
def test_canonicalize_smiles(test_client, smiles, expected):
    response = test_client.get(f"/api/editor/canonicalize_smiles", params={"smiles": smiles})
    response.raise_for_status()
    assert response.json() == expected


def test_enumerate_dataset(test_client):
    root = os.path.join(os.path.dirname(__file__), "testdata", "enumeration")
    template = os.path.join(root, "nielsen_fig1_template.txtpb")
    spreadsheet = os.path.join(root, "nielsen_fig1.csv")
    response = test_client.post(
        f"/api/editor/enumerate_dataset/{TEST_USER_ID}",
        files={"template": (template, open(template, "rb")), "spreadsheet": (spreadsheet, open(spreadsheet, "rb"))},
    )
    response.raise_for_status()
    dataset_name = response.json()
    assert dataset_name == "nielsen_fig1"
    response = test_client.get(
        "/api/editor/fetch_dataset", params={"user_id": TEST_USER_ID, "dataset_name": dataset_name}
    )
    response.raise_for_status()
    dataset = Dataset.FromString(b64decode(response.json()))
    assert len(dataset.reactions) == 80
