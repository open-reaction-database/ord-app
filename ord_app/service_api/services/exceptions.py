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
from functools import wraps

import psycopg.errors
from sqlalchemy.exc import IntegrityError


class BaseError(Exception):
    pass


class EntityNotFoundError(BaseError):
    pass


class ProtobufDecodeError(BaseError):
    pass


class UniqueViolation(BaseError):
    pass


class ForbiddenError(BaseError):
    pass


def psycopg_error_wrapper(coro):
    @wraps(coro)
    async def wrapper(*args, **kwargs):
        try:
            return await coro(*args, **kwargs)
        except IntegrityError as err:
            if isinstance(err.orig, psycopg.errors.UniqueViolation):
                raise UniqueViolation("Unique constraint violation caught") from err
            else:
                raise
    return wrapper
