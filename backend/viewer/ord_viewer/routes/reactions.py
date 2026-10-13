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

"""Reactions by ID, each with the molblocks the browser draws."""

import base64
from collections.abc import Sequence
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from ord_schema.proto import reaction_pb2
from ord_schema.search import execute

from ord_viewer.corpus import read_reactions
from ord_viewer.molblocks import reaction_molblocks
from ord_viewer.schemas import ReactionRecord
from ord_viewer.state import ViewerState, get_state

router = APIRouter(prefix="/api/reactions")

# One page of result cards. 100 IDs are about 4 KiB of query string. The corpus is
# always opened with execute.DEFAULT_MAX_ROWS (1000), so this cap is the tighter bound
# and the ValueError for too many IDs never reaches the route.
_MAX_IDS = 100


def fetch_records(
    corpus: execute.Corpus, reaction_ids: Sequence[str]
) -> list[ReactionRecord]:
    """Fetch reactions by ID, once each, in the order first asked.

    Args:
        corpus: The open corpus.
        reaction_ids: The reactions to fetch; unknown IDs are skipped.

    Returns:
        The known reactions with their molblocks.

    Raises:
        ValueError: If more IDs are asked for than the corpus returns in one call.
        execute.PairingError: If a reaction is stated in more than one source.
    """
    records = []
    for row in read_reactions(corpus, reaction_ids).to_pylist():
        blob = row["reaction"]
        records.append(
            ReactionRecord(
                reaction_id=row["reaction_id"],
                dataset_id=row["dataset_id"],
                binpb=base64.b64encode(blob).decode(),
                molblocks=reaction_molblocks(reaction_pb2.Reaction.FromString(blob)),
            )
        )
    return records


@router.get("")
def list_reactions(
    state: Annotated[ViewerState, Depends(get_state)],
    reaction_ids: Annotated[
        list[str], Query(alias="id", min_length=1, max_length=_MAX_IDS)
    ],
) -> list[ReactionRecord]:
    """Return up to 100 reactions, named by repeated id parameters.

    Args:
        state: The settings and open corpus.
        reaction_ids: The reactions to return.

    Returns:
        The known reactions, once each, in the order first asked.
    """
    return fetch_records(state.corpus, reaction_ids)


@router.get("/{reaction_id}")
def get_reaction(
    reaction_id: str, state: Annotated[ViewerState, Depends(get_state)]
) -> ReactionRecord:
    """Return one reaction.

    Args:
        reaction_id: The reaction to return.
        state: The settings and open corpus.

    Returns:
        The reaction with its molblocks.

    Raises:
        HTTPException: 404, if the corpus holds no such reaction.
    """
    records = fetch_records(state.corpus, [reaction_id])
    if not records:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"no reaction {reaction_id}")
    return records[0]
