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

"""The /api/datasets routes."""

from rdkit import Chem


def test_lists_datasets_by_name(client):
    response = client.get("/api/datasets")
    assert response.status_code == 200
    assert response.json() == [
        {
            "dataset_id": "ord_dataset-viewer01",
            "name": "viewer one",
            "description": "A Suzuki coupling and two acylations",
            "reactions": 3,
        },
        {
            "dataset_id": "ord_dataset-viewer02",
            "name": "viewer two",
            "description": "A mirror-image acylation and a named catalyst",
            "reactions": 2,
        },
    ]


def test_gets_one_dataset(client):
    response = client.get("/api/datasets/ord_dataset-viewer02")
    assert response.status_code == 200
    assert response.json()["reactions"] == 2


def test_an_unknown_dataset_is_not_found(client):
    assert client.get("/api/datasets/ord_dataset-nope").status_code == 404
    assert client.get("/api/datasets/ord_dataset-nope/compounds").status_code == 404


def test_counts_input_compounds_most_used_first(client):
    response = client.get("/api/datasets/ord_dataset-viewer01/compounds")
    assert response.status_code == 200
    rows = response.json()
    assert Chem.CanonSmiles(rows[0]["smiles"]) == Chem.CanonSmiles("CC(=O)Cl")
    assert rows[0]["count"] == 2
    assert "M  END" in rows[0]["molblock"]
    assert len(rows) == 5


def test_counts_products_and_skips_unstructured_inputs(client):
    products = client.get(
        "/api/datasets/ord_dataset-viewer02/compounds", params={"side": "products"}
    ).json()
    assert sorted(Chem.CanonSmiles(row["smiles"]) for row in products) == sorted(
        Chem.CanonSmiles(smiles) for smiles in ["C[C@H](NC(C)=O)C(=O)O", "CCOC(C)=O"]
    )
    inputs = client.get("/api/datasets/ord_dataset-viewer02/compounds").json()
    assert all(row["smiles"] for row in inputs)  # the named catalyst has no SMILES
    assert len(inputs) == 4


def test_limits_the_compound_counts(client):
    url = "/api/datasets/ord_dataset-viewer01/compounds"
    assert len(client.get(url, params={"limit": 1}).json()) == 1
    for bad in ({"limit": 0}, {"limit": 101}, {"side": "solvents"}):
        assert client.get(url, params=bad).status_code == 422
