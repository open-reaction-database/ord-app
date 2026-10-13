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

"""The datasets in the corpus, and the compounds their reactions use most."""

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from ord_schema.search import execute
from ord_schema.search.query import Query as SearchQuery

from ord_viewer.molblocks import smiles_molblock
from ord_viewer.schemas import CompoundCount, DatasetSummary
from ord_viewer.searching import run_search
from ord_viewer.state import ViewerState, get_state

router = APIRouter(prefix="/api/datasets")

# The repeated level each side's compounds live on.
_LEVELS = {"inputs": "inputs.components", "products": "outcomes.products"}


def _summaries(corpus: execute.Corpus) -> list[DatasetSummary]:
    """List the corpus's datasets by name.

    A source with no dataset ID can be neither addressed nor filtered on, so it is
    left out.

    Args:
        corpus: The open corpus.

    Returns:
        The datasets, sorted by name.
    """
    summaries = [
        DatasetSummary(**row)
        for row in corpus.datasets().to_pylist()
        if row["dataset_id"] is not None
    ]
    return sorted(summaries, key=lambda summary: summary.name)


def _find(corpus: execute.Corpus, dataset_id: str) -> DatasetSummary:
    """Return one dataset's summary.

    Args:
        corpus: The open corpus.
        dataset_id: The dataset to find.

    Returns:
        The dataset's summary.

    Raises:
        HTTPException: 404, if the corpus holds no such dataset.
    """
    for summary in _summaries(corpus):
        if summary.dataset_id == dataset_id:
            return summary
    raise HTTPException(status.HTTP_404_NOT_FOUND, f"no dataset {dataset_id}")


@router.get("")
def list_datasets(
    state: Annotated[ViewerState, Depends(get_state)],
) -> list[DatasetSummary]:
    """Return every dataset, sorted by name.

    Args:
        state: The settings and open corpus.

    Returns:
        The datasets, sorted by name.
    """
    return _summaries(state.corpus)


@router.get("/{dataset_id}")
def get_dataset(
    dataset_id: str, state: Annotated[ViewerState, Depends(get_state)]
) -> DatasetSummary:
    """Return one dataset.

    Args:
        dataset_id: The dataset to return.
        state: The settings and open corpus.

    Returns:
        The dataset's summary.

    Raises:
        HTTPException: 404, if the corpus holds no such dataset.
    """
    return _find(state.corpus, dataset_id)


@router.get("/{dataset_id}/compounds")
def dataset_compounds(
    dataset_id: str,
    state: Annotated[ViewerState, Depends(get_state)],
    side: Literal["inputs", "products"] = "inputs",
    limit: Annotated[int, Query(ge=1, le=100)] = 30,
) -> list[CompoundCount]:
    """Return the compounds a dataset's inputs or products use most, most first.

    Args:
        dataset_id: The dataset to count in.
        state: The settings and open corpus.
        side: Whether to count the reactions' inputs or their products.
        limit: The most compounds to return.

    Returns:
        The compounds with a SMILES, by descending count.

    Raises:
        HTTPException: 404 if the corpus holds no such dataset, 422 or 504 if the
            search fails.
    """
    _find(state.corpus, dataset_id)
    request = SearchQuery.model_validate(
        {
            "where": {
                "op": "eq",
                "path": "dataset_id",
                "value": {"literal": dataset_id},
            },
            "aggregate": {
                "over": _LEVELS[side],
                "where": {"op": "not_null", "path": "smiles"},
                "group_by": ["smiles"],
                "measures": [{"fn": "count", "name": "occurrences"}],
            },
            "order_by": [{"key": "occurrences", "descending": True}],
            "limit": limit,
        }
    )
    table = run_search(state, request)
    return [
        CompoundCount(
            smiles=row["smiles"],
            molblock=smiles_molblock(row["smiles"]),
            count=row["occurrences"],
        )
        for row in table.to_pylist()
    ]
