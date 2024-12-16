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
from datetime import datetime
from typing import Literal

from ord_app.service_api.schemas.base import BaseSchema
from ord_app.service_api.schemas.users import UserSchema

DownloadFileFormats = Literal["binpb", "json", "txtpb"]


class DatasetSchema(BaseSchema):
    id: int
    name: str
    created_at: datetime
    modified_at: datetime
    owner: UserSchema
    group: str = "mocked group"
    description: str | None


class DatasetCreateSchema(BaseSchema):
    name: str
    description: str | None = None
