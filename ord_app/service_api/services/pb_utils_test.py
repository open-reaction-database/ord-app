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
"""Unit tests for the dataset (de)serialization helpers, focused on Parquet."""

import pyarrow
import pytest
from google.protobuf import text_format
from ord_schema.proto.dataset_pb2 import Dataset

from ord_app.conftest import read_testdata_text
from ord_app.service_api.services.pb_utils import (
    MAP_FILE_EXT_TO_DATASET_KIND,
    MAP_FILE_EXT_TO_PB_KIND,
    load_dataset_message,
    validate_pb_kind_by_file_ext,
    write_dataset_message,
)


def _example_dataset() -> Dataset:
    dataset = Dataset()
    text_format.Parse(read_testdata_text("full.txtpb"), dataset)
    dataset.name = dataset.name or "full"
    dataset.description = dataset.description or "A test dataset"
    return dataset


def test_validate_pb_kind_parquet_only_for_dataset_map():
    # Parquet is dataset-level; it is not a valid kind for the per-message (Reaction) map.
    assert validate_pb_kind_by_file_ext("dataset.parquet") is None
    assert (
        validate_pb_kind_by_file_ext("dataset.parquet", MAP_FILE_EXT_TO_DATASET_KIND)
        == "parquet"
    )
    # The per-message protobuf kinds remain valid under both maps.
    assert validate_pb_kind_by_file_ext("dataset.binpb") == "binpb"
    assert ".parquet" not in MAP_FILE_EXT_TO_PB_KIND


def test_parquet_round_trip_preserves_dataset():
    dataset = _example_dataset()
    parquet_bytes = write_dataset_message(dataset, "parquet")

    loaded = load_dataset_message(parquet_bytes, "parquet")
    assert loaded.name == dataset.name
    assert loaded.description == dataset.description
    assert len(loaded.reactions) == len(dataset.reactions)
    # Reaction payloads survive the columnar round-trip byte-for-byte.
    assert [r.SerializeToString() for r in loaded.reactions] == [
        r.SerializeToString() for r in dataset.reactions
    ]


@pytest.mark.parametrize("kind", ("binpb", "json", "txtpb"))
def test_dataset_helpers_delegate_for_non_parquet_kinds(kind):
    dataset = _example_dataset()
    loaded = load_dataset_message(write_dataset_message(dataset, kind), kind)
    assert loaded.name == dataset.name
    assert len(loaded.reactions) == len(dataset.reactions)


def test_load_malformed_parquet_raises():
    with pytest.raises((ValueError, pyarrow.ArrowException)):
        load_dataset_message(b"this is not a parquet file", "parquet")


def test_write_parquet_requires_reactions_and_description():
    # ord-schema's Parquet writer requires a non-empty description and at least one reaction.
    no_reactions = Dataset(name="n", description="d")
    with pytest.raises(ValueError):
        write_dataset_message(no_reactions, "parquet")
