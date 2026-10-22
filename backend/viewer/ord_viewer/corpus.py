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

"""Opening the corpus a deployment serves."""

import concurrent.futures
import dataclasses
import functools
import glob
import os
import pathlib
from collections.abc import Callable

from ord_schema import huggingface
from ord_schema.artifacts import base
from ord_schema.search import execute

from ord_viewer.settings import Settings

# The trees under a local corpus directory. projections/, structures/, arrivals/, and
# sources/ each hold one shard level of files, as ord-data's data/<shard>/ does; pivots/
# and occurrences/ hold one subdirectory per level, each sharded the same way.
_TREES = ("projections", "structures", "arrivals", "pivots", "occurrences", "sources")

# Where a fetched corpus is kept under the corpus directory, each laid out as the
# repository it comes from: the derived artifacts, and the ord-data mirror's sources.
_FETCHED_ARTIFACTS = "ord-artifacts"
_FETCHED_SOURCES = "ord-data"

# How many source datasets download at once.
_SOURCE_DOWNLOADS = 8


@dataclasses.dataclass(frozen=True)
class _Trees:
    """Where a Corpus reads each tree: globs for files, directories for levels."""

    projections: str
    structures: str
    arrivals: str
    pivots: str
    occurrences: str
    sources: str


def _local_trees(root: pathlib.Path) -> _Trees:
    """Return the trees of a corpus laid out under root.

    Args:
        root: The corpus directory, holding each of _TREES.

    Returns:
        Where a Corpus reads each tree.

    Raises:
        FileNotFoundError: If root lacks one of its trees.
    """
    for tree in _TREES:
        if not (root / tree).is_dir():
            raise FileNotFoundError(f"{root} has no {tree}/ directory")
    # The file patterns are globs, so a metacharacter in root's own name is escaped.
    pattern_root = glob.escape(str(root))
    return _Trees(
        projections=f"{pattern_root}/projections/*/*.parquet",
        structures=f"{pattern_root}/structures/*/*.parquet",
        arrivals=f"{pattern_root}/arrivals/*/*.parquet",
        pivots=str(root / "pivots"),
        occurrences=str(root / "occurrences"),
        sources=f"{pattern_root}/sources/*/*.parquet",
    )


def _fetch_source(
    dataset_id: str, local_dir: pathlib.Path, *, revision: str
) -> pathlib.Path:
    """Fetch one source dataset's Parquet file from the ord-data mirror.

    Args:
        dataset_id: The dataset to fetch.
        local_dir: Directory to download beneath, laid out as the mirror is.
        revision: The mirror's branch, tag, or commit.

    Returns:
        The downloaded file, resolved.

    Raises:
        ValueError: If the mirror holds the dataset only in a format other than
            Parquet, which a Corpus cannot read as a source.
    """
    path = pathlib.Path(
        huggingface.fetch_dataset(
            dataset_id, revision=revision, local_dir=str(local_dir)
        )
    )
    if path.suffix != ".parquet":
        raise ValueError(
            f"the ord-data mirror at {revision} holds {dataset_id} only as {path.name}"
        )
    return path.resolve()


def _fetch_sources(
    projections: pathlib.Path, local_dir: pathlib.Path, *, revision: str
) -> None:
    """Fetch from the ord-data mirror the source dataset each projection restates.

    A Corpus refuses a source that no projection restates, so a Parquet file under
    local_dir that was not fetched, such as one an earlier build named, is deleted.
    One in a directory reached through a link is refused instead, since deleting it
    would reach storage local_dir does not own.

    Args:
        projections: The fetched projections, whose stamps name their sources.
        local_dir: Directory to download beneath, laid out as the mirror is, and
            resolved only as far as the directory its caller chose.
        revision: The mirror's branch, tag, or commit.

    Raises:
        ValueError: If a projection names no source dataset, the mirror holds a
            source only in a format other than Parquet, or a file to delete sits in
            a directory reached through a link.
    """
    dataset_ids = set()
    for path in huggingface.parquet_files(projections):
        dataset_id = base.load_stamps(path).source_dataset_id
        if dataset_id is None:
            raise ValueError(f"{path} names no source dataset to fetch")
        dataset_ids.add(dataset_id)
    fetch = functools.partial(_fetch_source, local_dir=local_dir, revision=revision)
    with concurrent.futures.ThreadPoolExecutor(_SOURCE_DOWNLOADS) as executor:
        fetched = set(executor.map(fetch, sorted(dataset_ids)))
    foreign = []
    for path in huggingface.parquet_files(local_dir):
        if path.resolve() in fetched:
            continue
        if path.parent.resolve().is_relative_to(local_dir):
            path.unlink()
        else:
            foreign.append(str(path))
    if foreign:
        raise ValueError(
            "no projection restates these sources, which sit in directories linked "
            f"from outside {local_dir} and were left in place: {foreign}"
        )


def _fetched_trees(
    root: pathlib.Path, *, artifacts_revision: str, sources_revision: str
) -> _Trees:
    """Fetch a corpus into root and return its trees.

    Each fetch downloads only what root lacks or holds stale, so a restart over the
    same root fetches little.

    Args:
        root: The directory to fetch beneath.
        artifacts_revision: The ord-artifacts revision to fetch the artifacts from,
            which must hold a build of this ord-schema's artifact schema and RDKit.
        sources_revision: The ord-data mirror's revision to fetch their sources from.

    Returns:
        Where a Corpus reads each tree.

    Raises:
        LookupError: If the artifacts revision holds a build of another artifact
            schema or RDKit, or lacks an artifact.
        ValueError: If a projection names no source dataset, the mirror holds a
            source only in a format other than Parquet, or a stale source sits in a
            directory reached through a link.
        RuntimeError: If the mirror holds no file for a source.
    """
    artifacts = huggingface.fetch_artifacts(
        root / _FETCHED_ARTIFACTS, revision=artifacts_revision
    )
    # Resolved only as far as root, which the deployment chose: a link below it leads
    # to storage this directory does not own.
    sources = root.resolve() / _FETCHED_SOURCES
    _fetch_sources(artifacts.projections, sources, revision=sources_revision)
    return _Trees(
        projections=artifacts.projection_pattern,
        structures=artifacts.structures_pattern,
        arrivals=artifacts.arrivals_pattern,
        pivots=str(artifacts.pivots),
        occurrences=str(artifacts.occurrences),
        sources=huggingface.parquet_pattern(sources),
    )


def open_corpus(
    settings: Settings, *, resolver: Callable[[str], str] | None
) -> execute.Corpus:
    """Open the corpus under settings.corpus_dir, fetched first if revisions are set.

    Args:
        settings: The service's settings.
        resolver: Resolves compound names in queries to SMILES; raises ValueError for
            a name it does not know. None uses ord-schema's resolvers.

    Returns:
        The open corpus, warmed, with its pivots checked.

    Raises:
        ValueError: If ORD_VIEWER_CORPUS_DIR is not set, a fetched source cannot be
            served, or a stale one sits behind a link and cannot be deleted.
        FileNotFoundError: If a local corpus directory lacks one of its trees.
        LookupError: If the artifacts revision holds a build this library cannot read.
        RuntimeError: If the ord-data mirror holds no file for a source.
        execute.PairingError: If the artifacts are stale or do not form one corpus.
    """
    if settings.corpus_dir is None:
        raise ValueError("ORD_VIEWER_CORPUS_DIR is not set")
    if settings.artifacts_revision is None or settings.sources_revision is None:
        trees = _local_trees(settings.corpus_dir)
    else:
        trees = _fetched_trees(
            settings.corpus_dir,
            artifacts_revision=settings.artifacts_revision,
            sources_revision=settings.sources_revision,
        )
    corpus = execute.Corpus(
        trees.projections,
        trees.structures,
        resolver=resolver,
        threads=max(1, (os.cpu_count() or 1) // settings.max_concurrent),
        require_current=True,
        pivots_dir=trees.pivots,
        require_pivots=True,
        occurrences_dir=trees.occurrences,
        require_occurrences=True,
        arrivals_pattern=trees.arrivals,
        memory_limit=settings.memory_limit,
        warm=True,
        max_rows=execute.DEFAULT_MAX_ROWS,
        sources_pattern=trees.sources,
    )
    try:
        corpus.check_pivots()
    except BaseException:
        corpus.close()
        raise
    return corpus
