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

from ord_app.service_api.domain.templates import TemplatesUseCase, get_templates_use_case
from ord_app.service_api.schemas.templates import TemplateCreateModel, TemplateResponseModel, TemplateUpdateModel

router = APIRouter(tags=["templates"], prefix="/templates")


@router.post("", response_model=TemplateResponseModel)
async def create_template(
    payload: TemplateCreateModel,
    use_case: Annotated[TemplatesUseCase, Depends(get_templates_use_case)],
):
    return await use_case.create(payload)


@router.get("", response_model=list[TemplateResponseModel])
async def get_all_templates(
    use_case: Annotated[TemplatesUseCase, Depends(get_templates_use_case)],
):
    return await use_case.all()


@router.get("/{template_id}", response_model=TemplateResponseModel)
async def get_template(
    template_id: int,
    use_case: Annotated[TemplatesUseCase, Depends(get_templates_use_case)],
):
    return await use_case.get(template_id)


@router.patch("/{template_id}", response_model=TemplateResponseModel)
async def update_template(
    template_id: int,
    payload: TemplateUpdateModel,
    use_case: Annotated[TemplatesUseCase, Depends(get_templates_use_case)],
):
    return await use_case.update(template_id, payload)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: int,
    use_case: Annotated[TemplatesUseCase, Depends(get_templates_use_case)],
):
    return await use_case.delete(template_id)
