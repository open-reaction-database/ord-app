# Copyright 2024 Open Reaction Database Project Authors
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

"""Reaction API endpoints."""
import gzip
from uuid import uuid4

from fastapi import APIRouter, Response

from ord_app.api import send_message, write_message
from ord_app.api.database import add_dataset, get_cursor, get_dataset

router = APIRouter(tags=["reactions"])


@router.get("/list_reactions")
async def list_reactions(user_id: str, dataset_name: str):
    """Fetches a list of reactions in a dataset."""
    with get_cursor() as cursor:
        dataset = get_dataset(user_id, dataset_name, cursor)
    if dataset is None:
        return Response(status_code=404)
    return [reaction.reaction_id for reaction in dataset.reactions]


@router.get("/fetch_reaction")
async def fetch_reaction(user_id: str, dataset_name: str, index: int):
    """Returns a base64-encoded reaction proto."""
    with get_cursor() as cursor:
        dataset = get_dataset(user_id, dataset_name, cursor)
    return send_message(dataset.reactions[index])


@router.get("/download_reaction")
async def download_reaction(user_id: str, dataset_name: str, index: int, kind: str):
    """Downloads a reaction."""
    with get_cursor() as cursor:
        dataset = get_dataset(user_id, dataset_name, cursor)
    if dataset is None:
        return Response(status_code=404)
    data = write_message(dataset.reactions[index], kind=kind)
    return Response(
        gzip.compress(data),
        headers={"Content-Disposition": f'attachment; filename="{dataset_name}-{index}.{kind}.gz"'},
        media_type="application/gzip",
    )


@router.get("/create_reaction")
def create_reaction(user_id: str, dataset_name: str, reaction_id: str | None = None):
    """Adds a new reaction to the dataset."""
    if reaction_id is None:
        reaction_id = f"ord-{uuid4().hex}"
    with get_cursor() as cursor:
        dataset = get_dataset(user_id, dataset_name, cursor)
        if dataset is None:
            return Response(status_code=404)
        reaction = dataset.reactions.add()
        reaction.reaction_id = reaction_id
        add_dataset(user_id, dataset, cursor)
    return len(dataset.reactions) - 1  # Index of the new reaction.


@router.get("/clone_reaction")
def clone_reaction(user_id: str, dataset_name: str, index: int):
    """Creates a copy of an existing reaction in the same dataset."""
    with get_cursor() as cursor:
        dataset = get_dataset(user_id, dataset_name, cursor)
        if dataset is None:
            return Response(status_code=404)
        dataset.reactions.add().CopyFrom(dataset.reactions[index])
        add_dataset(user_id, dataset, cursor)
    return len(dataset.reactions) - 1  # Index of the new reaction.


@router.get("/delete_reaction")
def delete_reaction(user_id: str, dataset_name: str, index: int):
    """Removes a reaction from the dataset."""
    with get_cursor() as cursor:
        dataset = get_dataset(user_id, dataset_name, cursor)
        if dataset is None:
            return Response(status_code=404)
        del dataset.reactions[index]
        add_dataset(user_id, dataset, cursor)
    return Response(status_code=200)
