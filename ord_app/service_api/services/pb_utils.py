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
import os
import tempfile
from base64 import b64encode
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path
from typing import TypeVar

from fastapi import HTTPException, UploadFile, status
from google.protobuf import json_format, text_format
from google.protobuf.descriptor import FieldDescriptor
from google.protobuf.message import Message
from ord_schema import parquet as parquet_dataset
from ord_schema.proto.dataset_pb2 import Dataset
from ord_schema.proto.reaction_pb2 import Reaction
from ord_schema.validations import ValidationOptions, validate_message
from starlette.concurrency import run_in_threadpool

# Constrained to the proto messages this module serializes; load_message returns
# the same concrete type passed via message_type rather than the bare union.
MessageT = TypeVar("MessageT", Dataset, Reaction)

# Maximum cumulative size of uploaded file attachments (Data.bytes_value) in a single reaction. (#543)
MAX_REACTION_ATTACHMENTS_SIZE = 10 * 1024 * 1024


def total_attachment_size(message: Message) -> int:
    """Sum the byte length of every Data.bytes_value attachment anywhere in a proto message.

    Walks the message tree (including repeated and map fields) so attachments nested in observations,
    analyses, compound features, etc. are all counted. Only set fields are visited, so empty
    bytes_value fields contribute nothing.

    Args:
        message: The protobuf message to inspect (typically a Reaction).

    Returns:
        The total number of bytes across all populated ``bytes_value`` fields.
    """
    total = 0
    for field, value in message.ListFields():
        if field.name == "bytes_value" and field.type == FieldDescriptor.TYPE_BYTES:
            total += len(value)
        elif field.type == FieldDescriptor.TYPE_MESSAGE:
            if field.label != FieldDescriptor.LABEL_REPEATED:
                total += total_attachment_size(value)
            elif field.message_type.GetOptions().map_entry:
                value_type = field.message_type.fields_by_name["value"].type
                if value_type == FieldDescriptor.TYPE_MESSAGE:
                    for item in value.values():
                        total += total_attachment_size(item)
                elif value_type == FieldDescriptor.TYPE_BYTES:
                    # Defensive: no map<string, bytes> exists in the Reaction schema today, but count
                    # it toward the cap if one is ever added so attachments there can't slip past.
                    total += sum(len(item) for item in value.values())
            else:
                for item in value:
                    total += total_attachment_size(item)
    return total


# Per-message protobuf serializations; valid for single-Reaction uploads and dataset uploads alike.
MAP_FILE_EXT_TO_PB_KIND = {
    ".json": "json",
    ".binpb": "binpb",
    ".pb": "binpb",
    ".txtpb": "txtpb",
    ".pbtxt": "txtpb",
}

# Dataset uploads additionally accept Parquet, a dataset-level (multi-reaction) columnar format
# that ord-schema reads from a file path rather than as a single serialized message. It is not a
# valid kind for single-Reaction uploads, so it is excluded from MAP_FILE_EXT_TO_PB_KIND above.
MAP_FILE_EXT_TO_DATASET_KIND = {**MAP_FILE_EXT_TO_PB_KIND, ".parquet": "parquet"}


def validate_pb_kind_by_file_ext(
    filename: str | None,
    ext_to_kind: dict[str, str] = MAP_FILE_EXT_TO_PB_KIND,
) -> str | None:
    if filename is None:
        return None
    suffixes = Path(filename).suffixes
    if suffixes and suffixes[-1] == ".gz" and len(suffixes) > 1:
        file_ext = suffixes[-2]
    else:
        file_ext = suffixes[-1] if suffixes else ""

    return ext_to_kind.get(file_ext)


async def validate_uploaded_pb_file(
    file: UploadFile,
    ext_to_kind: dict[str, str] = MAP_FILE_EXT_TO_PB_KIND,
) -> tuple[bytes, str]:
    kind = validate_pb_kind_by_file_ext(file.filename, ext_to_kind)
    if not kind:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Invalid file extension. Please use: {ext_to_kind.keys()}",
        )

    file_data = await file.read()
    if file.filename and file.filename.endswith(".gz"):
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
    raise_on_error: bool = False,
    options: ValidationOptions = ValidationOptions(require_provenance=True),
) -> tuple[bool | None, list[str], list[str]]:
    if reaction is None:
        return None, [], []

    try:
        output = validate_message(
            reaction, raise_on_error=raise_on_error, options=options
        )
    except Exception as err:
        return False, [str(err)], []
    errors, warnings = (
        list(map(_adjust_error, output.errors)),
        list(map(_adjust_error, output.warnings)),
    )
    if errors:
        return False, errors, warnings
    return True, errors, warnings


async def async_validate_pb_reaction(
    reaction: Reaction | None,
    raise_on_error: bool = False,
    options: ValidationOptions = ValidationOptions(require_provenance=True),
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
        output = await run_in_threadpool(
            validate_message, reaction, raise_on_error=raise_on_error, options=options
        )
    except Exception as err:
        return False, [str(err)], []

    errors, warnings = (
        list(map(_adjust_error, output.errors)),
        list(map(_adjust_error, output.warnings)),
    )
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


def load_message(data: bytes, message_type: type[MessageT], kind: str) -> MessageT:
    """Loads a serialized dataset or reaction.

    Args:
        data: Serialized proto.
        message_type: Message type to parse into (Dataset or Reaction).
        kind: Serialization kind.

    Returns:
        A proto of the type given by ``message_type``.
    """
    match kind:
        case "binpb":
            message = message_type.FromString(data)
        case "json":
            message = json_format.Parse(data, message_type())
        case "txtpb":
            message = text_format.Parse(data.decode(), message_type())
        case _:
            raise ValueError(kind)
    return message


@contextmanager
def _staged_parquet_path() -> Iterator[str]:
    """Yield a private, tempfile-generated path for staging a Parquet dataset on disk.

    ord-schema reads and writes Parquet from a filesystem path (via pyarrow), so dataset bytes
    must be staged on disk rather than handled in memory. The path comes straight from
    ``tempfile`` -- it is never derived from user input, so it cannot be used for path traversal --
    and the file is always removed on exit. The handle is closed before yielding so a subsequent
    open-by-name (pyarrow) does not alias it.

    Yields:
        The path to an empty temporary ``.parquet`` file.
    """
    fd, name = tempfile.mkstemp(suffix=".parquet")
    os.close(fd)
    try:
        yield name
    finally:
        os.unlink(name)


def load_dataset_message(file_data: bytes, kind: str) -> Dataset:
    """Deserialize an uploaded dataset file into a Dataset proto.

    Handles the dataset-level Parquet format (which ord-schema reads from a file path) in
    addition to the per-message protobuf serializations dispatched by ``load_message``.

    Args:
        file_data: Raw (already gunzipped) file contents.
        kind: Serialization kind; one of the values in ``MAP_FILE_EXT_TO_DATASET_KIND``.

    Returns:
        The parsed Dataset proto.

    Raises:
        ValueError: If ``kind`` is unknown, or if a Parquet file is not a valid ORD dataset.
    """
    if kind == "parquet":
        with _staged_parquet_path() as tmp_path:
            Path(tmp_path).write_bytes(file_data)
            return parquet_dataset.load_dataset(tmp_path)
    return load_message(file_data, Dataset, kind)


def write_dataset_message(dataset: Dataset, kind: str) -> bytes:
    """Serialize a Dataset proto, including the dataset-level Parquet format.

    Args:
        dataset: Dataset proto to serialize.
        kind: Serialization kind; one of the values in ``MAP_FILE_EXT_TO_DATASET_KIND``.

    Returns:
        The serialized dataset bytes.

    Raises:
        ValueError: If ``kind`` is unknown, or if ``kind`` is ``"parquet"`` and the dataset is
            missing the name/description/reactions that ord-schema requires for Parquet.
    """
    if kind == "parquet":
        with _staged_parquet_path() as tmp_path:
            parquet_dataset.save_dataset(dataset, tmp_path)
            return Path(tmp_path).read_bytes()
    return write_message(dataset, kind)


def send_message(message: Message) -> str:
    """Converts a protocol buffer message to a base64-encoded string."""
    return b64encode(message.SerializeToString()).decode()
