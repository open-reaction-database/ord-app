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

"""Opening the corpus a deployment serves, and resolving the names queries use."""

import glob
import os
from collections.abc import Callable

from ord_schema import resolvers
from ord_schema.search import execute

from ord_viewer.settings import Settings

# The trees under the corpus directory. projections/, structures/, and sources/ each
# hold one shard level of files, as ord-data's data/<shard>/ does; pivots/ and
# occurrences/ hold one subdirectory per level, each sharded the same way.
_TREES = ("projections", "structures", "pivots", "occurrences", "sources")


def resolve_compound_name(name: str) -> str:
    """Resolve a compound name to SMILES through ord-schema's resolvers.

    Args:
        name: A compound name from a query.

    Returns:
        The SMILES the first resolver to answer gives.

    Raises:
        ValueError: If no resolver knows the name.
    """
    smiles, _ = resolvers.resolve_name("name", name)
    return smiles


def open_corpus(
    settings: Settings, *, resolver: Callable[[str], str]
) -> execute.Corpus:
    """Open the corpus under settings.corpus_dir and publish every pivot level.

    Args:
        settings: The service's settings.
        resolver: Resolves compound names in queries to SMILES; raises ValueError for
            a name it does not know.

    Returns:
        The open corpus, warmed, with its pivots checked.

    Raises:
        ValueError: If ORD_VIEWER_CORPUS_DIR is not set.
        FileNotFoundError: If the corpus directory lacks one of its trees.
        execute.PairingError: If the artifacts are stale or do not form one corpus.
    """
    if settings.corpus_dir is None:
        raise ValueError("ORD_VIEWER_CORPUS_DIR is not set")
    root = settings.corpus_dir
    for tree in _TREES:
        if not (root / tree).is_dir():
            raise FileNotFoundError(f"{root} has no {tree}/ directory")
    # The file patterns are globs, so a metacharacter in root's own name is escaped;
    # the pivot and occurrence trees are passed as directories.
    pattern_root = glob.escape(str(root))
    corpus = execute.Corpus(
        f"{pattern_root}/projections/*/*.parquet",
        f"{pattern_root}/structures/*/*.parquet",
        resolver=resolver,
        threads=max(1, (os.cpu_count() or 1) // settings.max_concurrent),
        require_current=True,
        pivots_dir=str(root / "pivots"),
        require_pivots=True,
        occurrences_dir=str(root / "occurrences"),
        require_occurrences=True,
        memory_limit=settings.memory_limit,
        warm=True,
        max_rows=execute.DEFAULT_MAX_ROWS,
        sources_pattern=f"{pattern_root}/sources/*/*.parquet",
    )
    try:
        corpus.check_pivots()
    except BaseException:
        corpus.close()
        raise
    return corpus
