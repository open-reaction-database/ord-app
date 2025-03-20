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
from typing import Annotated

from fastapi import APIRouter, Depends, Response, UploadFile, status
from fastapi_pagination import Page

from ord_app.service_api.domain.auth import dataset_authorization
from ord_app.service_api.domain.reactions import ReactionsUseCase, get_reaction_use_case
from ord_app.service_api.schemas.datasets import DownloadFileFormats
from ord_app.service_api.schemas.reactions import ReactionCreateSchema, ReactionResponseSchema, ReactionUpdateSchema
from ord_app.service_api.services.pb_utils import validate_uploaded_pb_file

router = APIRouter(tags=["reactions"], prefix="/datasets/{dataset_id}/reactions")


@router.post(
    "",
    dependencies=[Depends(dataset_authorization(("admin", "editor")))],
    response_model=ReactionResponseSchema,
)
async def create_reaction(
    dataset_id: int,
    payload: ReactionCreateSchema,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)],
):
    return await use_case.create(dataset_id, payload)

@router.post(
    "/from-scratch",
    dependencies=[Depends(dataset_authorization(("admin", "editor")))],
    response_model=ReactionResponseSchema
)
async def create_reaction_from_scratch(
    dataset_id: int,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)]
):
    return await use_case.create_from_scratch(dataset_id)

@router.post(
    "/upload",
    dependencies=[Depends(dataset_authorization(("admin", "editor")))],
    response_model=ReactionResponseSchema,
)
async def upload_reaction(
    dataset_id: int,
    file: UploadFile,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)],
):
    file_data, kind = await validate_uploaded_pb_file(file)
    response =  await use_case.upload(dataset_id, file_data, kind)
    return response


@router.get(
    "",
    dependencies=[Depends(dataset_authorization(("admin", "editor", "viewer")))],
    response_model=Page[ReactionResponseSchema],
)
async def reactions(
    dataset_id: int,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)],
):
    return await use_case.paginate(dataset_id)


@router.get(
    "/search",
    dependencies=[Depends(dataset_authorization(("admin", "editor", "viewer")))],
    response_model=ReactionResponseSchema,
)
async def search_reaction(
    dataset_id: int,
    pb_reaction_id: str,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)],
):
    return await use_case.search(dataset_id=dataset_id, pb_reaction_id=pb_reaction_id)


@router.get(
    "/{reaction_id}",
    dependencies=[Depends(dataset_authorization(("admin", "editor", "viewer")))],
    response_model=ReactionResponseSchema,
)
async def reaction(
    dataset_id: int,
    reaction_id: int,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)],
):
    return await use_case.get(dataset_id, reaction_id)


@router.patch(
    "/{reaction_id}",
    dependencies=[Depends(dataset_authorization(("admin", "editor")))],
    response_model=ReactionResponseSchema,
)
async def update_reaction(
    dataset_id: int,
    reaction_id: int,
    payload: ReactionUpdateSchema,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)],
):
    return await use_case.update(dataset_id, reaction_id, payload)


@router.delete(
    "/{reaction_id}",
    dependencies=[Depends(dataset_authorization(("admin", "editor")))],
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_reaction(
    dataset_id: int,
    reaction_id: int,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)],
):
    return await use_case.delete(dataset_id, reaction_id)


@router.get(
    "/{reaction_id}/download",
    dependencies=[Depends(dataset_authorization(("admin", "editor", "viewer")))],
)
async def download_reaction(
    dataset_id: int,
    reaction_id: int,
    file_format: DownloadFileFormats,
    use_case: Annotated[ReactionsUseCase, Depends(get_reaction_use_case)],
):
    reaction, data = await use_case.download(dataset_id, reaction_id, file_format)
    filename = f"{reaction.pb_reaction_id}.{file_format}"
    return Response(
        data,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
