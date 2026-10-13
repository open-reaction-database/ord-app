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

"""The /api/download route."""

import gzip

from ord_schema.proto import dataset_pb2


def test_downloads_a_gzipped_dataset(client):
    response = client.post(
        "/api/download",
        json={"reaction_ids": ["ord-viewer0101", "ord-viewer0201", "ord-unknown"]},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/gzip"
    assert (
        'filename="ord-search-results.pb.gz"' in response.headers["content-disposition"]
    )
    dataset = dataset_pb2.Dataset.FromString(gzip.decompress(response.content))
    assert [reaction.reaction_id for reaction in dataset.reactions] == [
        "ord-viewer0101",
        "ord-viewer0201",
    ]


def test_describes_the_reactions_it_holds(client):
    descriptions = []
    for reaction_ids in (["ord-viewer0101"], ["ord-viewer0101", "ord-viewer0201"]):
        response = client.post("/api/download", json={"reaction_ids": reaction_ids})
        dataset = dataset_pb2.Dataset.FromString(gzip.decompress(response.content))
        descriptions.append(dataset.description)
    assert descriptions == [
        "1 reaction from the Open Reaction Database",
        "2 reactions from the Open Reaction Database",
    ]


def test_documents_the_gzip_response(client):
    paths = client.get("/api/openapi.json").json()["paths"]
    ok = paths["/api/download"]["post"]["responses"]["200"]
    assert "application/gzip" in ok["content"]
    assert ok["description"] == "A gzipped serialized ord.Dataset"


_NOT_FOUND = {"detail": "none of these reactions are in the corpus"}


def test_nothing_known_is_not_found(client):
    response = client.post("/api/download", json={"reaction_ids": ["ord-unknown"]})
    assert response.status_code == 404
    assert response.json() == _NOT_FOUND


def test_bounds_the_request(client):
    assert client.post("/api/download", json={"reaction_ids": []}).status_code == 422
    too_many = [f"ord-{index}" for index in range(1001)]
    response = client.post("/api/download", json={"reaction_ids": too_many})
    assert response.status_code == 422


def test_an_unknown_key_is_unprocessable(client):
    body = {"reaction_ids": ["ord-viewer0101"], "format": "zip"}
    response = client.post("/api/download", json=body)
    assert response.status_code == 422
    (error,) = response.json()["detail"]
    assert error["type"] == "extra_forbidden"
    assert error["loc"] == ["body", "format"]


def test_accepts_the_largest_request(client):
    largest = [f"ord-{index}" for index in range(1000)]
    response = client.post("/api/download", json={"reaction_ids": largest})
    assert response.status_code == 404
    assert response.json() == _NOT_FOUND
