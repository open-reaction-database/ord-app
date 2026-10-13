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

"""Reactions as a gzipped ord.Dataset, for a search's results or a selection."""

import gzip
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from ord_schema.proto import dataset_pb2, reaction_pb2

from ord_viewer.schemas import DownloadRequest, ErrorDetail
from ord_viewer.state import ViewerState, get_state

router = APIRouter(prefix="/api")


@router.post(
    "/download",
    response_class=Response,
    responses={
        200: {
            "content": {"application/gzip": {}},
            "description": "A gzipped serialized ord.Dataset",
        },
        404: {"model": ErrorDetail},
    },
)
def download(
    body: DownloadRequest, state: Annotated[ViewerState, Depends(get_state)]
) -> Response:
    """Return the known reactions among the IDs as one gzipped Dataset.

    Args:
        body: The reaction IDs to download.
        state: The settings and open corpus.

    Returns:
        A gzipped serialized Dataset holding each known reaction once, in the order
        first asked.

    Raises:
        HTTPException: 404, if the corpus holds none of the reactions.
    """
    table = state.corpus.reactions(body.reaction_ids)
    if table.num_rows == 0:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, "none of these reactions are in the corpus"
        )
    dataset = dataset_pb2.Dataset(
        name="ORD search results",
        description=(
            f"{table.num_rows} reaction{'s' if table.num_rows != 1 else ''} "
            "from the Open Reaction Database"
        ),
        reactions=[
            reaction_pb2.Reaction.FromString(blob)
            for blob in table.column("reaction").to_pylist()
        ],
    )
    disposition = 'attachment; filename="ord-search-results.pb.gz"'
    return Response(
        content=gzip.compress(dataset.SerializeToString()),
        media_type="application/gzip",
        headers={"Content-Disposition": disposition},
    )
