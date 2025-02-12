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
import gzip
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from ord_schema.proto.reaction_pb2 import Reaction
from ord_schema.validations import ValidationOptions, validate_message

MAP_FILE_EXT_TO_PB_KIND = {
    ".json": "json",
    ".binpb": "binpb",
    ".pb": "binpb",
    ".txtpb": "txtpb",
    ".pbtxt": "txtpb",
}


def validate_pb_kind_by_file_ext(filename):
    suffixes = Path(filename).suffixes
    if suffixes and suffixes[-1] == ".gz" and len(suffixes) > 1:
        file_ext = suffixes[-2]
    else:
        file_ext = suffixes[-1] if suffixes else ""

    return MAP_FILE_EXT_TO_PB_KIND.get(file_ext)


async def validate_uploaded_pb_file(file: UploadFile):
    kind = validate_pb_kind_by_file_ext(file.filename)
    if not kind:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Invalid file extension. Please use: {MAP_FILE_EXT_TO_PB_KIND.keys()}"
        )

    file_data = await file.read()
    if file.filename.endswith(".gz"):
        file_data = gzip.decompress(file_data)

    return file_data, kind


def _adjust_error(error: str) -> str:
    """Strips the message name from errors to make them more readable."""
    fields = error.split(":")
    location = ".".join(fields[0].strip().split(".")[1:])
    message = ":".join(fields[1:])
    if location:
        return f"{location}: {message.strip()}"
    return message.strip()


def validate_pb_reaction(
    reaction: Reaction, raise_on_error=False, require_provenance=False
) -> tuple[list[str], list[str]]:
    options = ValidationOptions(require_provenance=require_provenance)
    output = validate_message(reaction, raise_on_error=raise_on_error, options=options)
    return list(map(_adjust_error, output.errors)), list(map(_adjust_error, output.warnings))
