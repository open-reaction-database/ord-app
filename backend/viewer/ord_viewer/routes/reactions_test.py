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

"""The /api/reactions routes."""

import base64

from ord_schema.proto import reaction_pb2


def _get(client, *reaction_ids):
    return client.get(
        "/api/reactions", params=[("id", reaction_id) for reaction_id in reaction_ids]
    )


def test_returns_reactions_in_the_order_asked(client):
    response = _get(client, "ord-viewer0102", "ord-viewer0101")
    assert response.status_code == 200
    records = response.json()
    assert [record["reaction_id"] for record in records] == [
        "ord-viewer0102",
        "ord-viewer0101",
    ]
    assert records[0]["dataset_id"] == "ord_dataset-viewer01"
    reaction = reaction_pb2.Reaction.FromString(base64.b64decode(records[0]["binpb"]))
    assert reaction.reaction_id == "ord-viewer0102"
    molblocks = records[0]["molblocks"]
    assert all("M  END" in molblock for molblock in molblocks["inputs"]["reactants"])
    assert "M  END" in molblocks["outcomes"][0]["products"][0]["molblock"]
    assert molblocks["workups"] == []


def test_a_compound_without_a_structure_has_a_null_molblock(client):
    response = client.get("/api/reactions/ord-viewer0202")
    assert response.status_code == 200
    inputs = response.json()["molblocks"]["inputs"]
    assert inputs["catalysts"] == [None]
    assert all("M  END" in molblock for molblock in inputs["reactants"])


def test_repeated_and_unknown_ids(client):
    records = _get(client, "ord-viewer0101", "ord-viewer0101", "ord-unknown").json()
    assert [record["reaction_id"] for record in records] == ["ord-viewer0101"]
    assert _get(client, "ord-unknown").json() == []


def test_one_reaction(client):
    response = client.get("/api/reactions/ord-viewer0201")
    assert response.json()["dataset_id"] == "ord_dataset-viewer02"
    assert client.get("/api/reactions/ord-unknown").status_code == 404


def test_asks_for_at_least_one_reaction(client):
    assert client.get("/api/reactions").status_code == 422


def test_bounds_the_batch(client):
    too_many = _get(client, *[f"ord-{index}" for index in range(101)])
    assert too_many.status_code == 422
