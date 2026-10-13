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

"""The /api/search route."""

from typing import cast

import pytest
from fastapi import FastAPI

from ord_viewer.testing import make_client

_PYRIDINE_INPUT = {
    "op": "exists",
    "path": "inputs.components",
    "where": {"op": "substructure", "path": "smiles", "smarts": "c1ccncc1"},
}


def _ids(client, query):
    response = client.post("/api/search", json={"query": query})
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["kind"] == "reactions"
    return set(body["reaction_ids"])


def test_substructure(client):
    assert _ids(client, {"where": _PYRIDINE_INPUT}) == {"ord-viewer0101"}


def test_a_compound_by_name(client):
    where = {"op": "substructure", "path": "smiles", "compound": "pyridine"}
    query = {"where": {**_PYRIDINE_INPUT, "where": where}}
    assert _ids(client, query) == {"ord-viewer0101"}


def test_an_unknown_name_is_unprocessable(client):
    where = {"op": "substructure", "path": "smiles", "compound": "unobtainium"}
    query = {"where": {**_PYRIDINE_INPUT, "where": where}}
    response = client.post("/api/search", json={"query": query})
    assert response.status_code == 422
    assert "unobtainium" in response.json()["detail"]


@pytest.mark.parametrize(
    ("chirality", "expected"),
    [(True, {"ord-viewer0102"}), (False, {"ord-viewer0102", "ord-viewer0201"})],
)
def test_stereocenters_match_unless_told_not_to(client, chirality, expected):
    query = {
        "where": {
            "op": "exists",
            "path": "inputs.components",
            "where": {
                "op": "substructure",
                "path": "smiles",
                "smarts": "C[C@@H](N)C(=O)O",
                "chirality": chirality,
            },
        }
    }
    assert _ids(client, query) == expected


def test_a_yield_range(client):
    query = {
        "where": {
            "op": "exists",
            "path": "outcomes.products",
            "where": {
                "op": "exists",
                "path": "measurements",
                "where": {
                    "op": "and",
                    "clauses": [
                        {"op": "eq", "path": "type", "value": {"literal": "YIELD"}},
                        {
                            "op": "ge",
                            "path": "percentage.value",
                            "value": {"literal": 60},
                        },
                        {
                            "op": "le",
                            "path": "percentage.value",
                            "value": {"literal": 70},
                        },
                    ],
                },
            },
        }
    }
    assert _ids(client, query) == {"ord-viewer0101"}


def test_a_dataset(client):
    query = {
        "where": {
            "op": "eq",
            "path": "dataset_id",
            "value": {"literal": "ord_dataset-viewer02"},
        }
    }
    assert _ids(client, query) == {"ord-viewer0201", "ord-viewer0202"}


def test_a_reaction_smarts(client):
    query = {"where": {"op": "reaction_smarts", "smarts": "cB(O)O.c[Br,I]>>c-c"}}
    assert _ids(client, query) == {"ord-viewer0101"}


def test_no_match_is_an_empty_answer(client):
    where = {"op": "substructure", "path": "smiles", "smarts": "[Xe]"}
    query = {"where": {**_PYRIDINE_INPUT, "where": where}}
    response = client.post("/api/search", json={"query": query})
    assert response.json() == {
        "kind": "reactions",
        "reaction_ids": [],
        "truncated": False,
    }


def test_an_aggregate_is_a_table(client):
    query = {
        "aggregate": {
            "group_by": ["dataset_id"],
            "measures": [{"fn": "count", "name": "reactions"}],
        }
    }
    body = client.post("/api/search", json={"query": query}).json()
    assert body["kind"] == "table"
    assert body["columns"] == ["dataset_id", "reactions"]
    assert sorted(body["rows"]) == [
        ["ord_dataset-viewer01", 3],
        ["ord_dataset-viewer02", 2],
    ]


def test_bad_queries_are_unprocessable(client):
    unknown_path = {
        "where": {"op": "eq", "path": "no_such_field", "value": {"literal": 1}}
    }
    assert client.post("/api/search", json={"query": unknown_path}).status_code == 422
    extra_key = {"where": _PYRIDINE_INPUT, "page": 2}
    assert client.post("/api/search", json={"query": extra_key}).status_code == 422


def test_a_search_past_its_timeout(corpus_dir):
    with make_client(corpus_dir, search_timeout_seconds=1e-9) as client:
        response = client.post(
            "/api/search", json={"query": {"where": _PYRIDINE_INPUT}}
        )
    assert response.status_code == 504


def test_a_failed_search_frees_its_slot(corpus_dir):
    with make_client(corpus_dir, max_concurrent=1, slot_wait_seconds=0.05) as client:
        bad = {"where": {"op": "eq", "path": "no_such_field", "value": {"literal": 1}}}
        assert client.post("/api/search", json={"query": bad}).status_code == 422
        ok = {"query": {"where": _PYRIDINE_INPUT}}
        assert client.post("/api/search", json=ok).status_code == 200
        with cast(FastAPI, client.app).state.viewer.slots.hold():
            busy = client.post("/api/search", json=ok)
        assert busy.status_code == 503
