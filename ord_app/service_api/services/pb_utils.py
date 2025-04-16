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
from base64 import b64encode
from pathlib import Path
from typing import Type

from fastapi import HTTPException, UploadFile, status
from google.protobuf import json_format, text_format
from google.protobuf.message import Message
from ord_schema.proto.dataset_pb2 import Dataset
from ord_schema.proto.reaction_pb2 import Reaction
from ord_schema.validations import ValidationOptions, validate_message
from starlette.concurrency import run_in_threadpool

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


async def validate_pb_reaction(
    reaction: Reaction | None,
    raise_on_error=False,
    options=ValidationOptions(require_provenance=True)
) -> tuple[bool | None, list[str], list[str]]:
    if reaction is None:
        return None, [], []

    try:
        output = validate_message(reaction, raise_on_error=raise_on_error, options=options)
    except Exception as err:
        return False, [str(err)], []
    errors, warnings = list(map(_adjust_error, output.errors)), list(map(_adjust_error, output.warnings))
    if errors:
        return False, errors, warnings
    return True, errors, warnings


async def async_validate_pb_reaction(
    reaction: Reaction | None,
    raise_on_error=False,
    options=ValidationOptions(require_provenance=True)
) -> tuple[bool | None, list[str], list[str]]:
    """
    Asynchronously validate a protocol buffer reaction.

    This function validates a Reaction object by executing the validation process
    in a thread pool. Although the validation is CPU-bound, it may take a significant
    amount of time, so running it in a thread pool prevents blocking the main thread.
    """
    if reaction is None:
        return None, [], []

    try:
        output = await run_in_threadpool(validate_message, reaction, raise_on_error=raise_on_error, options=options)
    except Exception as err:
        return False, [str(err)], []

    errors, warnings = list(map(_adjust_error, output.errors)), list(map(_adjust_error, output.warnings))
    if errors:
        return False, errors, warnings
    return True, errors, warnings


def write_message(message: Dataset | Reaction, kind: str) -> bytes:
    """Serializes a dataset or reaction.

    Args:
        message: Dataset or Reaction proto.
        kind: Serialization kind.

    Returns:
        Serialized proto.
    """
    match kind:
        case "binpb":
            data = message.SerializeToString()
        case "json":
            data = json_format.MessageToJson(message).encode()
        case "txtpb":
            data = text_format.MessageToBytes(message)
        case _:
            raise ValueError(kind)
    return data


def load_message(data: bytes, message_type: Type[Dataset | Reaction], kind: str) -> Dataset | Reaction:
    """Loads a serialized dataset.

    Args:
        data: Serialized dataset proto.
        message_type: Message type.
        kind: Serialization kind.

    Returns:
        Dataset or Reaction proto.
    """
    match kind:
        case "binpb":
            dataset = message_type.FromString(data)
        case "json":
            dataset = json_format.Parse(data, message_type())
        case "txtpb":
            dataset = text_format.Parse(data.decode(), message_type())
        case _:
            raise ValueError(kind)
    return dataset



def send_message(message: Message) -> str:
    """Converts a protocol buffer message to a base64-encoded string."""
    return b64encode(message.SerializeToString()).decode()
