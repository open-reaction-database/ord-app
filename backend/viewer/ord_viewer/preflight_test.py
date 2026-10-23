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
import pathlib
import shutil
from typing import BinaryIO

import pytest
from ord_schema import huggingface, message_helpers
from ord_schema.artifacts import base
from ord_schema.search import execute
from rdkit import rdBase

from ord_viewer import preflight
from ord_viewer.corpus import open_corpus
from ord_viewer.settings import Settings
from ord_viewer.testing import offline_resolver

# The commit the fake Hub resolves every ord-artifacts revision to.
COMMIT = "artifacts-commit"
SOURCES_REVISION = "data-commit"


@dataclasses.dataclass
class Hub:
    """The paths each repository holds, which a test may change before checking.

    Attributes:
        artifacts: The paths ord-artifacts holds at COMMIT.
        mirrored: The paths the ord-data mirror holds at SOURCES_REVISION.
        downloads: The arguments of each snapshot_download fetch_artifacts made.
    """

    artifacts: list[str]
    mirrored: list[str]
    downloads: list[dict[str, object]] = dataclasses.field(default_factory=list)

    def drop(self, directory: str) -> None:
        """Remove the files beneath one directory from ord-artifacts."""
        self.artifacts = [
            path for path in self.artifacts if not path.startswith(f"{directory}/")
        ]


class _FileSystem:
    """Opens ord-artifacts paths at COMMIT from a local tree laid out the same way."""

    def __init__(self, root: pathlib.Path):
        self._root = root

    def open(self, location: str, *, block_size: int) -> BinaryIO:
        del block_size  # Only the Hub reads in blocks.
        prefix = f"datasets/{huggingface.ORD_ARTIFACTS_HF_REPO}@{COMMIT}/"
        assert location.startswith(prefix), location
        return (self._root / location.removeprefix(prefix)).open("rb")


@pytest.fixture
def hub(monkeypatch, corpus_dir) -> Hub:
    """Answer the Hub's listings and footer reads from the derived test corpus."""
    files = sorted(
        path.relative_to(corpus_dir).as_posix()
        for path in corpus_dir.rglob("*")
        if path.is_file()
    )
    sources = [path for path in files if path.startswith("sources/")]
    hub = Hub(
        artifacts=[path for path in files if path not in sources],
        mirrored=[
            message_helpers.id_filename(pathlib.PurePath(path).name) for path in sources
        ],
    )

    def list_repo_files(repo_id, *, repo_type, revision):
        assert repo_type == "dataset"
        if repo_id == huggingface.ORD_ARTIFACTS_HF_REPO:
            assert revision == COMMIT
            return list(hub.artifacts)
        assert (repo_id, revision) == (huggingface.ORD_DATA_HF_REPO, SOURCES_REVISION)
        return list(hub.mirrored)

    file_system = _FileSystem(corpus_dir)
    monkeypatch.setattr(huggingface, "resolve_revision", lambda revision: COMMIT)
    monkeypatch.setattr(
        huggingface, "snapshot_download", lambda **kwargs: hub.downloads.append(kwargs)
    )
    # ord-schema's fetch_artifacts reads through its own names for these.
    for module in (preflight, huggingface):
        monkeypatch.setattr(module, "list_repo_files", list_repo_files)
        monkeypatch.setattr(module, "HfFileSystem", lambda: file_system)
    return hub


def test_passes_the_artifacts_fetch_artifacts_downloads(hub, tmp_path):
    commit, projections = preflight.check_artifacts("main")
    assert commit == COMMIT
    assert projections == [p for p in hub.artifacts if p.startswith("projections/")]
    assert projections
    huggingface.fetch_artifacts(tmp_path, revision="main")
    assert len(hub.downloads) == 1


@pytest.mark.parametrize("artifact", list(huggingface.ARTIFACT_DIRECTORIES))
def test_refuses_a_revision_that_lacks_an_artifact(hub, tmp_path, artifact):
    hub.drop(huggingface.ARTIFACT_DIRECTORIES[artifact])
    refusal = rf"ord-artifacts@main holds no {artifact} artifacts"
    with pytest.raises(LookupError, match=refusal):
        preflight.check_artifacts("main")
    # fetch_artifacts refuses it too, before downloading anything.
    with pytest.raises(LookupError, match=refusal):
        huggingface.fetch_artifacts(tmp_path, revision="main")
    assert not hub.downloads


@pytest.mark.parametrize(
    ("module", "name", "value", "refusal"),
    [
        (
            rdBase,
            "rdkitVersion",
            "2000.01.1",
            r"reads schema version 1 under RDKit 2000",
        ),
        (base, "ARTIFACT_SCHEMA_VERSION", "0", r"reads schema version 0 under RDKit"),
    ],
)
def test_refuses_a_build_this_viewer_cannot_read(
    hub, monkeypatch, tmp_path, module, name, value, refusal
):
    # The viewer's side of the comparison moves; the build's stamps stay.
    monkeypatch.setattr(module, name, value)
    with pytest.raises(LookupError, match=refusal):
        preflight.check_artifacts("main")
    with pytest.raises(LookupError, match=r"Install the ord-schema and RDKit"):
        huggingface.fetch_artifacts(tmp_path, revision="main")
    assert not hub.downloads


# Each name is a prefix of another level's or path's, which stays.
@pytest.mark.parametrize(
    ("directory", "refusal"),
    [
        ("pivots/inputs", r"holds no pivot artifacts for \['inputs'\]"),
        (
            "occurrences/outcomes.products",
            r"holds no occurrence artifacts for \['outcomes\.products'\]",
        ),
    ],
)
def test_refuses_a_build_the_viewer_cannot_open(
    hub, corpus_dir, tmp_path, directory, refusal
):
    hub.drop(directory)
    with pytest.raises(LookupError, match=refusal):
        preflight.check_artifacts("main")
    # The viewer refuses the same tree when it opens it.
    local = tmp_path / "corpus"
    shutil.copytree(corpus_dir, local)
    shutil.rmtree(local / directory)
    with pytest.raises(execute.PairingError, match="this corpus was opened requiring"):
        open_corpus(Settings(corpus_dir=local), resolver=offline_resolver)


def test_counts_the_sources_the_projections_name(hub):
    commit, projections = preflight.check_artifacts("main")
    count = preflight.check_sources(commit, projections, revision=SOURCES_REVISION)
    assert count == len(hub.mirrored)


def test_refuses_a_projection_that_names_no_source(hub, monkeypatch):
    commit, projections = preflight.check_artifacts("main")
    stamps_from_metadata = base.stamps_from_metadata
    monkeypatch.setattr(
        base,
        "stamps_from_metadata",
        lambda raw: dataclasses.replace(
            stamps_from_metadata(raw), source_dataset_id=None
        ),
    )
    with pytest.raises(ValueError, match=r"projections/.* names no source dataset"):
        preflight.check_sources(commit, projections, revision=SOURCES_REVISION)


def test_refuses_a_source_the_mirror_lacks(hub):
    commit, projections = preflight.check_artifacts("main")
    absent = hub.mirrored.pop()
    with pytest.raises(
        RuntimeError,
        match=rf"ord-data@data-commit holds no file for {pathlib.Path(absent).stem}$",
    ):
        preflight.check_sources(commit, projections, revision=SOURCES_REVISION)


def test_refuses_a_source_the_mirror_holds_only_as_a_binary_proto(hub):
    commit, projections = preflight.check_artifacts("main")
    parquet = hub.mirrored.pop()
    hub.mirrored.append(parquet.removesuffix(".parquet") + ".pb.gz")
    with pytest.raises(
        ValueError,
        match=rf"holds {pathlib.Path(parquet).stem} only as binary protos$",
    ):
        preflight.check_sources(commit, projections, revision=SOURCES_REVISION)


def test_main_checks_the_revisions_the_environment_names(hub, monkeypatch, capsys):
    monkeypatch.setenv("ORD_VIEWER_ARTIFACTS_REVISION", "main")
    monkeypatch.setenv("ORD_VIEWER_SOURCES_REVISION", SOURCES_REVISION)
    preflight.main()
    assert capsys.readouterr().out == (
        f"open-reaction-database/ord-artifacts@{COMMIT} holds a build this viewer "
        f"reads, and open-reaction-database/ord-data@{SOURCES_REVISION} holds the "
        f"{len(hub.mirrored)} sources it names\n"
    )


def test_main_refuses_without_revisions(monkeypatch):
    monkeypatch.delenv("ORD_VIEWER_ARTIFACTS_REVISION", raising=False)
    monkeypatch.delenv("ORD_VIEWER_SOURCES_REVISION", raising=False)
    with pytest.raises(ValueError, match="name the corpus to check"):
        preflight.main()
