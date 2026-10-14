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

"""The command that derives the test corpus, and the end-to-end tests' app."""

import pytest
from fastapi.testclient import TestClient

from ord_viewer.testing import (
    ASK_SCRIPTS,
    ScriptedAskClient,
    derive_corpus,
    e2e_app,
    main,
    make_client,
)


def test_main_derives_a_corpus_the_app_serves(tmp_path):
    main([str(tmp_path / "corpus")])
    with make_client(tmp_path / "corpus") as client:
        assert client.get("/api/reactions/ord-viewer0101").status_code == 200


def test_main_derives_into_an_empty_directory_that_exists(tmp_path):
    main([str(tmp_path)])
    assert (tmp_path / "pivots").is_dir()


def test_main_refuses_a_directory_that_holds_files(tmp_path):
    (tmp_path / "notes.txt").write_text("")
    with pytest.raises(ValueError, match="is not empty"):
        main([str(tmp_path)])


def _inputs_holding(compound: str) -> dict:
    return {
        "query": {
            "where": {
                "op": "exists",
                "path": "inputs.components",
                "where": {
                    "op": "same_compound",
                    "path": "smiles",
                    "compound": compound,
                },
            }
        }
    }


def test_e2e_app_serves_the_environments_corpus(tmp_path, monkeypatch):
    derive_corpus(tmp_path)
    monkeypatch.setenv("ORD_VIEWER_CORPUS_DIR", str(tmp_path))
    with TestClient(e2e_app()) as client:
        assert client.get("/api/reactions/ord-viewer0101").status_code == 200


def test_e2e_app_resolves_names_offline(tmp_path, monkeypatch):
    derive_corpus(tmp_path)
    monkeypatch.setenv("ORD_VIEWER_CORPUS_DIR", str(tmp_path))
    with TestClient(e2e_app()) as client:
        assert (
            client.post("/api/search", json=_inputs_holding("pyridine")).status_code
            == 200
        )
        unknown = client.post("/api/search", json=_inputs_holding("benzene"))
        assert unknown.status_code == 422
        assert "benzene" in unknown.json()["detail"]


def test_e2e_app_answers_its_scripted_questions(tmp_path, monkeypatch):
    derive_corpus(tmp_path)
    monkeypatch.setenv("ORD_VIEWER_CORPUS_DIR", str(tmp_path))
    with TestClient(e2e_app()) as client:
        response = client.post(
            "/api/ask", json={"question": "reactions that use acetyl chloride"}
        )
        assert response.status_code == 200, response.text
        body = response.json()
        assert body["text"] == "Three reactions use acetyl chloride."
        assert body["result"]["reaction_ids"] == [
            "ord-viewer0102",
            "ord-viewer0103",
            "ord-viewer0201",
        ]
        table = client.post(
            "/api/ask", json={"question": "how many reactions are in each dataset"}
        )
        assert table.json()["result"] == {
            "kind": "table",
            "columns": ["dataset_id", "reactions"],
            "rows": [["ord_dataset-viewer01", 3], ["ord_dataset-viewer02", 2]],
            "truncated": False,
        }


def test_e2e_app_cannot_answer_other_questions(tmp_path, monkeypatch):
    derive_corpus(tmp_path)
    monkeypatch.setenv("ORD_VIEWER_CORPUS_DIR", str(tmp_path))
    with TestClient(e2e_app()) as client:
        response = client.post("/api/ask", json={"question": "what does pyridine cost"})
        assert response.status_code == 422
        assert "no script" in response.json()["detail"]


def test_scripted_client_answers_from_the_question_in_each_request():
    client = ScriptedAskClient({"q": ({"limit": 1}, "an answer")})
    query_call = client.create(tools=[], messages=[{"role": "user", "content": "q"}])
    assert query_call.content[0].input == {"limit": 1}
    answer_call = client.create(
        messages=[{"role": "user", "content": "Question: q\n\nResult:\nrows"}]
    )
    assert answer_call.content[0].text == "an answer"


def test_every_script_compiles(tmp_path):
    derive_corpus(tmp_path)
    with make_client(tmp_path) as client:
        for query, _ in ASK_SCRIPTS.values():
            response = client.post("/api/search", json={"query": query})
            assert response.status_code == 200, (query, response.text)
