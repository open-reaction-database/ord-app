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

"""Checking, without fetching it, that the viewer can fetch the corpus it is given.

Run ``python -m ord_viewer.preflight`` from backend/viewer with the deployment's
ORD_VIEWER_ARTIFACTS_REVISION and ORD_VIEWER_SOURCES_REVISION. It reads the two
repositories' file listings and one footer per projection, and refuses what fetching
the corpus at startup would: an artifacts revision that lacks an artifact or holds a
build of another artifact schema or RDKit, a projection that names no source, and a
source the mirror lacks or holds only as a binary proto. A source whose contents differ
from what its projection was derived from passes; only opening the corpus checks that.
"""

import concurrent.futures
import functools

import pyarrow.parquet as pq
from huggingface_hub import HfFileSystem, list_repo_files
from ord_schema import huggingface, message_helpers
from ord_schema.artifacts import base
from rdkit import rdBase

from ord_viewer.settings import Settings

# Enough to hold a projection's footer, so reading it fetches little else.
_FOOTER_BLOCK_SIZE = 64 * 1024

# How many projection footers are read at once.
_FOOTER_READS = 8


def _parquet_beneath(paths: list[str], directory: str) -> list[str]:
    """Return the Parquet files among paths that sit beneath directory, sorted."""
    return sorted(
        path
        for path in paths
        if path.startswith(f"{directory}/") and path.endswith(".parquet")
    )


def check_artifacts(revision: str) -> tuple[str, list[str]]:
    """Refuse an ord-artifacts revision that fetch_artifacts would refuse.

    These are the checks fetch_artifacts makes before it downloads anything: every
    artifact is present, and the build is stamped with this ord-schema's artifact
    schema version and this RDKit.

    Args:
        revision: Branch, tag, or commit of ord-artifacts.

    Returns:
        The commit the revision names, and the paths of the projections it holds.

    Raises:
        LookupError: If the revision lacks an artifact, or holds a build of another
            artifact schema version or RDKit.
    """
    commit = huggingface.resolve_revision(revision)
    published = list_repo_files(
        huggingface.ORD_ARTIFACTS_HF_REPO, repo_type="dataset", revision=commit
    )
    missing = [
        artifact
        for artifact, directory in huggingface.ARTIFACT_DIRECTORIES.items()
        if not _parquet_beneath(published, directory)
    ]
    # With every artifact present, the occurrences have a footer to read.
    stamps = None if missing else huggingface.published_build(commit, published)
    if stamps is None:
        raise LookupError(
            f"{huggingface.ORD_ARTIFACTS_HF_REPO}@{revision} holds no "
            f"{', '.join(missing)} artifacts"
        )
    if (stamps.artifact_schema_version, stamps.rdkit_version) != (
        base.ARTIFACT_SCHEMA_VERSION,
        rdBase.rdkitVersion,
    ):
        raise LookupError(
            f"{huggingface.ORD_ARTIFACTS_HF_REPO}@{revision} holds artifact schema "
            f"version {stamps.artifact_schema_version} derived under RDKit "
            f"{stamps.rdkit_version}, and this viewer reads schema version "
            f"{base.ARTIFACT_SCHEMA_VERSION} under RDKit {rdBase.rdkitVersion}"
        )
    projections = huggingface.ARTIFACT_DIRECTORIES["projection"]
    return commit, _parquet_beneath(published, projections)


def _stamps_in_place(commit: str, path: str) -> base.Stamps:
    """Return the stamps of one ord-artifacts file, reading only its footer.

    Args:
        commit: The ord-artifacts commit holding the file.
        path: The file's path in the repository.

    Returns:
        The file's stamps.
    """
    location = f"datasets/{huggingface.ORD_ARTIFACTS_HF_REPO}@{commit}/{path}"
    with (
        HfFileSystem().open(location, block_size=_FOOTER_BLOCK_SIZE) as handle,
        pq.ParquetFile(handle) as parquet_file,
    ):
        return base.stamps_from_metadata(parquet_file.schema_arrow.metadata or {})


def check_sources(commit: str, projections: list[str], *, revision: str) -> int:
    """Refuse a mirror revision that lacks a Parquet file for a projection's source.

    Args:
        commit: The ord-artifacts commit holding the projections.
        projections: The projections' paths in ord-artifacts.
        revision: Branch, tag, or commit of the ord-data mirror.

    Returns:
        How many source datasets the projections name.

    Raises:
        ValueError: If a projection names no source dataset, or the mirror holds a
            source only as a binary proto, which a Corpus cannot read.
        RuntimeError: If the mirror holds no file for a source.
    """
    read = functools.partial(_stamps_in_place, commit)
    with concurrent.futures.ThreadPoolExecutor(_FOOTER_READS) as executor:
        stamps = list(executor.map(read, projections))
    dataset_ids = set()
    for path, stamped in zip(projections, stamps, strict=True):
        if stamped.source_dataset_id is None:
            raise ValueError(f"{path} names no source dataset to fetch")
        dataset_ids.add(stamped.source_dataset_id)
    mirrored = set(
        list_repo_files(
            huggingface.ORD_DATA_HF_REPO, repo_type="dataset", revision=revision
        )
    )
    binary = []
    absent = []
    for dataset_id in sorted(dataset_ids):
        if message_helpers.id_filename(f"{dataset_id}.parquet") in mirrored:
            continue
        if message_helpers.id_filename(f"{dataset_id}.pb.gz") in mirrored:
            binary.append(dataset_id)
        else:
            absent.append(dataset_id)
    mirror = f"{huggingface.ORD_DATA_HF_REPO}@{revision}"
    if absent:
        raise RuntimeError(f"{mirror} holds no file for {', '.join(absent)}")
    if binary:
        raise ValueError(f"{mirror} holds {', '.join(binary)} only as binary protos")
    return len(dataset_ids)


def main() -> None:
    """Check the revisions the environment names, and print what they hold.

    Raises:
        ValueError: If ORD_VIEWER_ARTIFACTS_REVISION and ORD_VIEWER_SOURCES_REVISION
            are not both set, or as check_sources raises.
        LookupError: As check_artifacts raises.
        RuntimeError: As check_sources raises.
    """
    settings = Settings()
    if settings.artifacts_revision is None or settings.sources_revision is None:
        raise ValueError(
            "ORD_VIEWER_ARTIFACTS_REVISION and ORD_VIEWER_SOURCES_REVISION name the "
            "corpus to check"
        )
    commit, projections = check_artifacts(settings.artifacts_revision)
    count = check_sources(commit, projections, revision=settings.sources_revision)
    print(
        f"{huggingface.ORD_ARTIFACTS_HF_REPO}@{commit} holds a build this viewer "
        f"reads, and {huggingface.ORD_DATA_HF_REPO}@{settings.sources_revision} "
        f"holds the {count} sources it names"
    )


if __name__ == "__main__":
    main()
