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
from fastapi import HTTPException, status


class ProtobufDecodeError(HTTPException):
    def __init__(self, detail: str, **kwargs):
        super().__init__(status.HTTP_400_BAD_REQUEST, detail=detail, **kwargs)


class UnauthenticatedError(HTTPException):
    def __init__(self, detail: str, **kwargs):
        super().__init__(status.HTTP_401_UNAUTHORIZED, detail=detail, **kwargs)


class ForbiddenError(HTTPException):
    def __init__(self, detail: str, **kwargs):
        super().__init__(status.HTTP_403_FORBIDDEN, detail=detail, **kwargs)


class EntityNotFoundError(HTTPException):
    def __init__(self, detail: str, **kwargs):
        super().__init__(status.HTTP_404_NOT_FOUND, detail=detail, **kwargs)


class ConflictError(HTTPException):
    def __init__(self, detail: str, **kwargs):
        super().__init__(status.HTTP_409_CONFLICT, detail=detail, **kwargs)


class UnprocessableEntityError(HTTPException):
    def __init__(self, detail: str, **kwargs):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail, **kwargs)
