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
from collections.abc import AsyncIterator, Sequence

import pytest
from google.protobuf import text_format
from ord_schema.proto.dataset_pb2 import Dataset
from ord_schema.proto.reaction_pb2 import ReactionNotes

from ord_app.conftest import read_testdata_text
from ord_app.service_api.services.dataset_downloads import (
    binpb_reactions,
    stream_dataset,
)
from ord_app.service_api.services.pb_utils import (
    load_dataset_message,
    write_dataset_message,
)


def _example_dataset() -> Dataset:
    """Returns a dataset as the app stores one: a name, a description, and reactions."""
    parsed = Dataset()
    text_format.Parse(read_testdata_text("full.txtpb"), parsed)
    dataset = Dataset(
        name="C–N coupling at 25 °C",
        description="Volumes in µL",
        reactions=parsed.reactions,
    )
    dataset.reactions.add(
        reaction_id="non-ascii",
        notes=ReactionNotes(procedure_details="Stirred in 5 µL THF at 25 °C – 2 h"),
    )
    # Over 16 KiB serialized, so its length takes a three-byte varint in binpb.
    dataset.reactions.add(
        reaction_id="large", notes=ReactionNotes(procedure_details="x" * 20_000)
    )
    return dataset


async def _batches(
    binpbs: Sequence[bytes], batch_size: int
) -> AsyncIterator[Sequence[bytes]]:
    for start in range(0, len(binpbs), batch_size):
        yield binpbs[start : start + batch_size]


async def _stream(dataset: Dataset, kind: str, batch_size: int) -> bytes:
    """Streams ``dataset`` the way a download does: its own fields, then its reactions."""
    fields = Dataset(name=dataset.name, description=dataset.description)
    binpbs = [reaction.SerializeToString() for reaction in dataset.reactions]
    chunks = stream_dataset(fields, kind, _batches(binpbs, batch_size))
    return b"".join([chunk async for chunk in chunks])


@pytest.mark.parametrize("batch_size", [1, 2, 1000])
@pytest.mark.parametrize("kind", ["binpb", "json", "txtpb", "parquet"])
async def test_stream_dataset_round_trips(kind, batch_size):
    dataset = _example_dataset()

    loaded = load_dataset_message(await _stream(dataset, kind, batch_size), kind)

    assert loaded.name == dataset.name
    assert loaded.description == dataset.description
    assert list(loaded.reactions) == list(dataset.reactions)


@pytest.mark.parametrize("kind", ["binpb", "json", "txtpb"])
async def test_stream_dataset_matches_the_whole_dataset_serializer(kind):
    dataset = _example_dataset()

    streamed = load_dataset_message(await _stream(dataset, kind, 2), kind)

    assert streamed == load_dataset_message(write_dataset_message(dataset, kind), kind)


@pytest.mark.parametrize("kind", ["binpb", "json", "txtpb"])
async def test_stream_dataset_without_reactions(kind):
    dataset = Dataset(name="empty", description="no reactions")

    assert load_dataset_message(await _stream(dataset, kind, 2), kind) == dataset


async def test_stream_dataset_rejects_an_unknown_kind():
    with pytest.raises(ValueError, match="csv"):
        await _stream(Dataset(name="n", description="d"), "csv", 2)


def test_binpb_reactions_match_protobuf_encoding():
    # Stored reactions are copied in as `reactions` fields without parsing; the bytes must
    # be exactly what protobuf writes for a dataset holding only those reactions.
    reactions = list(_example_dataset().reactions)

    encoded = binpb_reactions([reaction.SerializeToString() for reaction in reactions])

    assert encoded == Dataset(reactions=reactions).SerializeToString()
