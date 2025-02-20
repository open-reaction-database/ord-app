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

from fastapi import APIRouter, Depends, status

from ord_app.service_api.domain.auth import group_authorization
from ord_app.service_api.domain.groups import (
    GroupMembersUseCases,
    GroupUseCases,
    get_group_members_use_case,
    get_group_use_case,
)
from ord_app.service_api.schemas.groups import (
    GroupAddMemberSchema,
    GroupCreateSchema,
    GroupMemberSchema,
    GroupSchema,
    GroupUpdateMemberSchema,
    GroupUserSchema,
)

router = APIRouter(tags=["group"], prefix="/groups")


@router.post("", response_model=GroupSchema, status_code=status.HTTP_201_CREATED)
async def create_group(payload: GroupCreateSchema, use_case: Annotated[GroupUseCases, Depends(get_group_use_case)]):
    return await use_case.create(payload)


@router.get("", response_model=list[GroupUserSchema])
async def list_current_user_groups(use_case: Annotated[GroupUseCases, Depends(get_group_use_case)]):
    response = await use_case.user_groups()
    return response


@router.get(
    "/{group_id}",
    response_model=GroupSchema,
    dependencies=[Depends(group_authorization(("admin", "editor", "viewer")))],
)
async def get_group(group_id: int, use_case: Annotated[GroupUseCases, Depends(get_group_use_case)]):
    return await use_case.get(group_id)


@router.patch(
    "/{group_id}",
    status_code=status.HTTP_201_CREATED,
    response_model=GroupSchema,
    dependencies=[Depends(group_authorization(("admin",)))],
)
async def update_group(
    group_id: int, payload: GroupCreateSchema, use_case: Annotated[GroupUseCases, Depends(get_group_use_case)]
):
    return await use_case.update(group_id, payload)


@router.delete(
    "/{group_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(group_authorization(("admin",)))],
)
async def delete_group(group_id: int, use_case: Annotated[GroupUseCases, Depends(get_group_use_case)]):
    await use_case.delete(group_id)


@router.get(
    "/{group_id}/members",
    dependencies=[Depends(group_authorization(("admin", "editor", "viewer")))],
    response_model=list[GroupMemberSchema],
)
async def get_group_members(
    group_id: int, use_case: Annotated[GroupMembersUseCases, Depends(get_group_members_use_case)]
):
    return await use_case.all(group_id)


@router.post(
    "/{group_id}/members",
    dependencies=[Depends(group_authorization(("admin",)))],
    response_model=GroupMemberSchema,
    status_code=status.HTTP_201_CREATED,
)
async def add_member(
    group_id: int,
    payload: GroupAddMemberSchema,
    use_case: Annotated[GroupMembersUseCases, Depends(get_group_members_use_case)],
):
    return await use_case.add_member(group_id, payload)


@router.patch(
    "/{group_id}/members",
    dependencies=[Depends(group_authorization(("admin",)))],
    response_model=GroupMemberSchema,
    status_code=status.HTTP_201_CREATED,
)
async def update_member(
    group_id: int,
    payload: GroupUpdateMemberSchema,
    use_case: Annotated[GroupMembersUseCases, Depends(get_group_members_use_case)],
):
    return await use_case.update_member(group_id, payload)


@router.post(
    "/{group_id}/members/remove",
    dependencies=[Depends(group_authorization(("admin",)))],
    status_code=status.HTTP_200_OK,
)
async def remove_group_members(
    group_id: int, payload: list[int], use_case: Annotated[GroupMembersUseCases, Depends(get_group_members_use_case)]
):
    await use_case.remove_members(group_id, payload)
