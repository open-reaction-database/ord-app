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
from typing import Optional

from pydantic import BaseModel

MAX_CRITICAL_FIELD_LENGTH = 512


class BaseSchema(BaseModel):
    @staticmethod
    def parse_bool(value: str) -> Optional[bool]:
        value_lower = value.lower()
        if value_lower in {"none", "null"}:
            return None
        if value_lower in {"true", "1"}:
            return True
        if value_lower in {"false", "0"}:
            return False
        raise ValueError(f"Incorrect value: {value}")
