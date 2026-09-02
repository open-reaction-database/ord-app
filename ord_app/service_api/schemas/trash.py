# Copyright 2024 Open Reaction Database Project Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
from datetime import datetime
from typing import Literal

from ord_app.service_api.schemas.base import BaseSchema
from ord_app.service_api.schemas.users import UserResponseSchema


class TrashDatasetResponseSchema(BaseSchema):
    id: int
    name: str | None
    deleted_at: datetime
    deleted_by: UserResponseSchema | None


class TrashReactionResponseSchema(BaseSchema):
    id: int
    pb_reaction_id: str
    deleted_at: datetime
    deleted_by: UserResponseSchema | None


class TrashResponseSchema(BaseSchema):
    datasets: list[TrashDatasetResponseSchema]
    reactions: list[TrashReactionResponseSchema]


class TrashRestoreSchema(BaseSchema):
    kind: Literal["dataset", "reaction"]
    id: int
