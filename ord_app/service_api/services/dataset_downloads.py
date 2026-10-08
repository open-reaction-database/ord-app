# Copyright 2026 Open Reaction Database Project Authors
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
"""Serializes a dataset for download a batch of reactions at a time.

A download holds a bounded number of reactions in memory. Except for Parquet, which
writes its footer last, its first bytes go out before the last reactions are read.
"""

import json
import textwrap
from collections.abc import AsyncGenerator, AsyncIterator, Iterator, Sequence
from contextlib import aclosing
from functools import partial
from pathlib import Path

from google.protobuf import json_format, text_format
from ord_schema import parquet as parquet_dataset
from ord_schema.proto.dataset_pb2 import Dataset
from ord_schema.proto.reaction_pb2 import Reaction
from starlette.concurrency import iterate_in_threadpool, run_in_threadpool

from ord_app.service_api.services.pb_utils import staged_parquet_path

# Bytes per chunk when a staged Parquet file is read back for the response.
_PARQUET_CHUNK_SIZE = 1 << 20


def _varint(value: int) -> bytes:
    """Returns ``value`` encoded as a protobuf base-128 varint."""
    encoded = bytearray()
    while value > 0x7F:
        encoded.append((value & 0x7F) | 0x80)
        value >>= 7
    encoded.append(value)
    return bytes(encoded)


# Key of Dataset.reactions: the field number, and wire type 2 (length-delimited).
_REACTIONS_KEY = _varint(Dataset.REACTIONS_FIELD_NUMBER << 3 | 2)


def binpb_header(dataset: Dataset) -> bytes:
    """Returns the binpb encoding of the dataset's own fields."""
    return dataset.SerializeToString()


def binpb_reactions(binpbs: Sequence[bytes]) -> bytes:
    """Returns stored reactions as binpb ``reactions`` fields, without parsing them."""
    return b"".join(_REACTIONS_KEY + _varint(len(data)) + data for data in binpbs)


def text_header(dataset: Dataset) -> bytes:
    """Returns the text format of the dataset's own fields."""
    return text_format.MessageToBytes(dataset, as_utf8=True)


def text_reactions(binpbs: Sequence[bytes]) -> bytes:
    """Returns stored reactions as text-format ``reactions { ... }`` blocks."""
    blocks = (
        "reactions {\n"
        + text_format.MessageToString(Reaction.FromString(data), as_utf8=True, indent=2)
        + "}\n"
        for data in binpbs
    )
    return "".join(blocks).encode()


def json_header(dataset: Dataset) -> bytes:
    """Returns the dataset's own fields as JSON, through the opening of ``reactions``."""
    fields = json_format.MessageToDict(dataset)
    lines = "".join(
        f"  {json.dumps(key)}: {json.dumps(value)},\n" for key, value in fields.items()
    )
    return ("{\n" + lines + '  "reactions": [').encode()


def json_reactions(binpbs: Sequence[bytes]) -> bytes:
    """Returns stored reactions as comma-separated elements of ``reactions``."""
    elements = (
        "\n"
        + textwrap.indent(
            json_format.MessageToJson(Reaction.FromString(data), indent=2), "    "
        )
        for data in binpbs
    )
    return ",".join(elements).encode()


# Per format: the header, the serializer for a batch of reactions, the separator between
# batches, and the footer.
_WRITERS = {
    "binpb": (binpb_header, binpb_reactions, b"", b""),
    "txtpb": (text_header, text_reactions, b"", b""),
    "json": (json_header, json_reactions, b",", b"\n  ]\n}"),
}


async def stream_dataset(
    dataset: Dataset, kind: str, batches: AsyncIterator[Sequence[bytes]]
) -> AsyncGenerator[bytes]:
    """Yields a dataset serialized as ``kind``, one batch of reactions at a time.

    Each batch is serialized in a worker thread, so the event loop stays free.

    Args:
        dataset: The dataset's own fields; its reactions come from ``batches``.
        kind: ``binpb``, ``json``, ``txtpb``, or ``parquet``.
        batches: Batches of serialized Reaction messages, in download order.

    Yields:
        Chunks of the serialized dataset.

    Raises:
        ValueError: If ``kind`` is not one of the above.
    """
    if kind == "parquet":
        # Closing this stream closes the Parquet one, which removes its staged file.
        async with aclosing(_stream_parquet(dataset, batches)) as chunks:
            async for chunk in chunks:
                yield chunk
        return
    if kind not in _WRITERS:
        raise ValueError(kind)
    header, reactions, separator, footer = _WRITERS[kind]
    yield header(dataset)
    first = True
    async for batch in batches:
        if not batch:
            continue
        if not first and separator:
            yield separator
        yield await run_in_threadpool(reactions, batch)
        first = False
    if footer:
        yield footer


def _write_parquet_batch(
    writer: parquet_dataset.DatasetWriter, batch: Sequence[bytes]
) -> None:
    """Writes stored reactions to a Parquet writer, which flushes every 1,000 rows."""
    for data in batch:
        writer.write(Reaction.FromString(data))


def _read_chunks(path: str) -> Iterator[bytes]:
    """Yields a file's bytes a chunk at a time; driven from a worker thread."""
    with Path(path).open("rb") as handle:
        yield from iter(partial(handle.read, _PARQUET_CHUNK_SIZE), b"")


async def _stream_parquet(
    dataset: Dataset, batches: AsyncIterator[Sequence[bytes]]
) -> AsyncGenerator[bytes]:
    """Writes the dataset to a staged Parquet file, then yields the file's bytes.

    Parquet writes its footer last, so the file is complete before its first byte goes
    out. Opening, writing, and closing the writer all run in worker threads. The staged
    file is removed when the stream finishes or is closed.

    Args:
        dataset: The dataset's name and description.
        batches: Batches of serialized Reaction messages, written a batch at a time.

    Yields:
        Chunks of the Parquet file.
    """
    with staged_parquet_path() as path:
        writer = await run_in_threadpool(
            parquet_dataset.DatasetWriter,
            path,
            name=dataset.name,
            description=dataset.description,
        )
        # On an error, leaving the block aborts the write. Otherwise close() flushes the
        # last row group and the footer, and the block's own close is then a no-op.
        with writer:
            async for batch in batches:
                await run_in_threadpool(_write_parquet_batch, writer, batch)
            await run_in_threadpool(writer.close)
        async for chunk in iterate_in_threadpool(_read_chunks(path)):
            yield chunk
