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

"""Dataset API endpoints."""

import gzip
from base64 import b64encode

from fastapi import APIRouter, Response, UploadFile
from ord_schema.proto.dataset_pb2 import Dataset

from ord_app.api import load_dataset, write_message
from ord_app.api.database import add_dataset, get_cursor, get_dataset

router = APIRouter(tags=["datasets"])


@router.get("/list_datasets")
async def list_datasets(user_id: str):
    """Returns a list of all datasets associated with the given user."""
    datasets = []
    with get_cursor() as cursor:
        cursor.execute("SELECT dataset_name FROM datasets WHERE user_id = %s", (user_id,))
        for row in cursor:
            datasets.append(row["dataset_name"])
    return datasets


@router.get("/fetch_dataset")
async def fetch_dataset(user_id: str, dataset_name: str):
    """Returns a base64-encoded dataset proto."""
    with get_cursor() as cursor:
        cursor.execute("SELECT binpb FROM datasets WHERE user_id = %s AND dataset_name = %s", (user_id, dataset_name))
        row = cursor.fetchone()
    if row is None:
        return Response(status_code=404)
    return b64encode(row["binpb"]).decode()


@router.get("/download_dataset")
async def download_dataset(user_id: str, dataset_name: str, kind: str):
    """Downloads a dataset."""
    # NOTE(skearnes): See https://protobuf.dev/reference/protobuf/textformat-spec/#text-format-files for comments on
    # preferred file extensions.
    with get_cursor() as cursor:
        dataset = get_dataset(user_id, dataset_name, cursor)
    if dataset is None:
        return Response(status_code=404)
    data = write_message(dataset, kind=kind)
    return Response(
        gzip.compress(data),
        headers={"Content-Disposition": f'attachment; filename="{dataset_name}.{kind}.gz"'},
        media_type="application/gzip",
    )


@router.post("/upload_dataset/{user_id}")
async def upload_dataset(user_id: str, file: UploadFile):
    """Uploads a dataset."""
    data = await file.read()
    if file.filename.endswith(".gz"):
        data = gzip.decompress(data)
    if ".json" in file.filename:
        kind = "json"
    elif ".binpb" in file.filename:
        kind = "binpb"
    elif ".txtpb" in file.filename:
        kind = "txtpb"
    else:
        raise ValueError(file.filename)
    dataset = load_dataset(data, kind)
    with get_cursor() as cursor:
        add_dataset(user_id, dataset, cursor)


@router.get("/create_dataset")
async def create_dataset(user_id: str, dataset_name: str):
    """Creates a new dataset."""
    with get_cursor() as cursor:
        if get_dataset(user_id, dataset_name, cursor) is not None:
            return Response(status_code=409)
        dataset = Dataset(name=dataset_name)
        try:
            add_dataset(user_id, dataset, cursor)
        except ValueError as error:
            return Response(str(error), status_code=400)


@router.get("/delete_dataset")
async def delete_dataset(user_id: str, dataset_name: str):
    """Deletes a dataset."""
    with get_cursor() as cursor:
        cursor.execute("DELETE FROM datasets WHERE user_id = %s AND dataset_name = %s", (user_id, dataset_name))
