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

import pyarrow as pa
from ord_schema.search import execute
from rdkit import Chem

from ord_viewer import main
from ord_viewer.testing import hold_slot, make_client


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


def test_sorts_by_name_ignoring_case_and_skips_sources_without_an_id(
    client, monkeypatch
):
    # The rows run in dataset_id order and their names the other way; "Banana" would
    # sort before "apple" in a case-sensitive order.
    datasets = pa.table(
        {
            "dataset_id": ["ord_dataset-a", "ord_dataset-b", "ord_dataset-c", None],
            "name": ["cherry", "Banana", "apple", "aardvark"],
            "description": ["first", "second", "third", "unaddressable"],
            "reactions": [1, 2, 3, 4],
        }
    )
    monkeypatch.setattr(execute.Corpus, "datasets", lambda self: datasets)
    response = client.get("/api/datasets")
    assert response.status_code == 200
    assert [row["name"] for row in response.json()] == ["apple", "Banana", "cherry"]


def test_gets_one_dataset(client):
    response = client.get("/api/datasets/ord_dataset-viewer02")
    assert response.status_code == 200
    assert response.json()["reactions"] == 2


def test_gets_the_newest_submitted_dataset(client):
    response = client.get("/api/datasets/newest")
    assert response.status_code == 200
    assert response.json() == {
        "dataset_id": "ord_dataset-viewer02",
        "name": "viewer two",
        "description": "A mirror-image acylation and a named catalyst",
        "reactions": 2,
        "submitted": "2025-06-15",
    }


def test_no_dataset_is_newest_when_no_record_holds_a_change(corpus_dir, monkeypatch):
    monkeypatch.setattr(main, "newest_submission", lambda corpus: None)
    with make_client(corpus_dir) as undated:
        response = undated.get("/api/datasets/newest")
    assert response.status_code == 200
    assert response.json() is None


def test_an_unknown_dataset_is_not_found(client):
    for suffix in ("", "/compounds"):
        response = client.get(f"/api/datasets/ord_dataset-nope{suffix}")
        assert response.status_code == 404
        assert response.json() == {"detail": "no dataset ord_dataset-nope"}


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
    assert client.get(url, params={"limit": 100}).status_code == 200
    for bad in ({"limit": 0}, {"limit": 101}, {"side": "solvents"}):
        assert client.get(url, params=bad).status_code == 422


def test_orders_tied_counts_by_smiles(client):
    rows = client.get("/api/datasets/ord_dataset-viewer02/compounds").json()
    assert {row["count"] for row in rows} == {1}
    smiles = [row["smiles"] for row in rows]
    assert smiles == sorted(smiles)


def test_a_limit_keeps_the_first_tied_compounds_in_smiles_order(client):
    url = "/api/datasets/ord_dataset-viewer02/compounds"
    every = [row["smiles"] for row in client.get(url).json()]
    for _ in range(5):
        kept = client.get(url, params={"limit": 2}).json()
        assert [row["smiles"] for row in kept] == every[:2]


def test_the_compound_counts_wait_for_a_search_slot(corpus_dir):
    url = "/api/datasets/ord_dataset-viewer01/compounds"
    with make_client(corpus_dir, max_concurrent=1, slot_wait_seconds=0.05) as client:
        with hold_slot(client):
            response = client.get(url)
        assert response.status_code == 503
        assert client.get(url).status_code == 200
