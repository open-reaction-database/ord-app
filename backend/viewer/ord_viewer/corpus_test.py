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

import dataclasses
import datetime
import pathlib
import shutil
from typing import cast

import pyarrow as pa
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from ord_schema import huggingface, message_helpers
from ord_schema.artifacts import base
from ord_schema.search import execute

from ord_viewer.corpus import Arrival, newest_arrival, open_corpus
from ord_viewer.settings import Settings
from ord_viewer.testing import make_client, offline_resolver

ARTIFACTS_REVISION = "artifacts-commit"
SOURCES_REVISION = "data-commit"


def fetching_settings(root: pathlib.Path) -> Settings:
    """Return settings that fetch the corpus into root at the test revisions."""
    return Settings(
        corpus_dir=root,
        artifacts_revision=ARTIFACTS_REVISION,
        sources_revision=SOURCES_REVISION,
    )


def fetching_client(root: pathlib.Path) -> TestClient:
    """Return an unentered client that fetches the corpus into root."""
    return make_client(
        root, artifacts_revision=ARTIFACTS_REVISION, sources_revision=SOURCES_REVISION
    )


@pytest.fixture
def hub(monkeypatch, corpus_dir) -> list[tuple[str, str]]:
    """Answer fetches from the derived test corpus, laid out as each repository is.

    Returns:
        The (repository, revision) of each fetch, in the order asked.
    """
    asked = []

    def fetch_artifacts(local_dir, *, revision):
        asked.append(("ord-artifacts", revision))
        root = pathlib.Path(local_dir)
        fetched = {}
        for artifact, directory in huggingface.ARTIFACT_DIRECTORIES.items():
            fetched[artifact] = root / directory
            shutil.copytree(
                corpus_dir / directory, fetched[artifact], dirs_exist_ok=True
            )
        return huggingface.FetchedArtifacts(
            revision=revision,
            projections=fetched["projection"],
            structures=fetched["structures"],
            arrivals=fetched["arrivals"],
            pivots=fetched["pivot"],
            occurrences=fetched["occurrences"],
        )

    def fetch_dataset(dataset_id, *, revision, local_dir):
        asked.append(("ord-data", revision))
        filename = message_helpers.id_filename(f"{dataset_id}.parquet")
        path = pathlib.Path(local_dir) / filename
        path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(corpus_dir / "sources" / "aa" / path.name, path)
        return str(path)

    monkeypatch.setattr(huggingface, "fetch_artifacts", fetch_artifacts)
    monkeypatch.setattr(huggingface, "fetch_dataset", fetch_dataset)
    return asked


def test_serves_a_fetched_corpus_as_the_local_one_it_matches(hub, client, tmp_path):
    # A glob metacharacter in the directory's name, which every pattern must escape.
    with fetching_client(tmp_path / "corpus[1]") as fetched:
        for path in ("/api/health", "/api/datasets"):
            assert fetched.get(path).json() == client.get(path).json()
    assert (
        hub
        == [("ord-artifacts", ARTIFACTS_REVISION)]
        + [("ord-data", SOURCES_REVISION)] * 2
    )


def test_deletes_a_source_the_fetched_build_does_not_restate(hub, corpus_dir, tmp_path):
    # The same dataset under another name: a Corpus would refuse it as a duplicate.
    stale = tmp_path / "ord-data" / "data" / "zz" / "ord_dataset-zz.parquet"
    stale.parent.mkdir(parents=True)
    shutil.copy(corpus_dir / "sources" / "aa" / "ord_dataset-viewer01.parquet", stale)
    with fetching_client(tmp_path) as fetched:
        assert fetched.get("/api/health").status_code == 200
    assert not stale.exists()


def test_leaves_a_stale_source_in_a_linked_directory_in_place(
    hub, corpus_dir, tmp_path
):
    outside = tmp_path / "outside" / "ord_dataset-zz.parquet"
    outside.parent.mkdir()
    shutil.copy(corpus_dir / "sources" / "aa" / "ord_dataset-viewer01.parquet", outside)
    root = tmp_path / "corpus"
    (root / "ord-data" / "data").mkdir(parents=True)
    (root / "ord-data" / "data" / "zz").symlink_to(outside.parent)
    settings = fetching_settings(root)
    with pytest.raises(ValueError, match="linked from outside .* left in place"):
        open_corpus(settings, resolver=offline_resolver)
    assert outside.exists()


def test_refuses_a_source_the_mirror_holds_only_as_a_binary_proto(
    hub, monkeypatch, tmp_path
):
    monkeypatch.setattr(
        huggingface,
        "fetch_dataset",
        lambda dataset_id, **_: str(tmp_path / f"{dataset_id}.pb.gz"),
    )
    settings = fetching_settings(tmp_path)
    with pytest.raises(
        ValueError, match=r"mirror at data-commit holds ord_dataset-viewer0\d only as"
    ):
        open_corpus(settings, resolver=offline_resolver)


def test_refuses_a_projection_that_names_no_source(hub, monkeypatch, tmp_path):
    load_stamps = base.load_stamps
    monkeypatch.setattr(
        base,
        "load_stamps",
        lambda path: dataclasses.replace(load_stamps(path), source_dataset_id=None),
    )
    settings = fetching_settings(tmp_path)
    with pytest.raises(ValueError, match="names no source dataset to fetch"):
        open_corpus(settings, resolver=offline_resolver)


def _corpus(client: TestClient) -> execute.Corpus:
    """Return the corpus an entered client's app holds."""
    return cast(FastAPI, client.app).state.viewer.corpus


def test_finds_the_newest_arrival_by_each_dataset_s_first_commit(client):
    # A reaction was added to viewer one after viewer two arrived; viewer one's first
    # commit still leaves it the earlier arrival.
    assert newest_arrival(_corpus(client)) == Arrival(
        dataset_id="ord_dataset-viewer02",
        arrived=datetime.date(2023, 3, 2),
    )


def test_finds_no_arrival_when_no_reaction_has_a_first_commit(client, monkeypatch):
    unmatched = pa.table(
        {
            "dataset_id": pa.array([], type=pa.string()),
            "arrived": pa.array([], type=pa.date32()),
        }
    )
    monkeypatch.setattr(execute.Corpus, "search", lambda self, request: unmatched)
    assert newest_arrival(_corpus(client)) is None
