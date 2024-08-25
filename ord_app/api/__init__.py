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
"""Editor API helper functions."""
from base64 import b64encode

from google.protobuf import json_format, text_format
from google.protobuf.message import Message
from ord_schema.proto.dataset_pb2 import Dataset
from ord_schema.proto.reaction_pb2 import Reaction

from ord_app.api.database import add_dataset, get_cursor, get_dataset
from ord_app.api.testing import setup_test_postgres


def write_message(message: Dataset | Reaction, kind: str) -> bytes:
    """Serializes a dataset or reaction.

    Args:
        message: Dataset or reaction proto.
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


def load_dataset(data: bytes, kind: str) -> Dataset:
    """Loads a serialized dataset.

    Args:
        data: Serialized dataset proto.
        kind: Serialization kind.

    Returns:
        Dataset proto.
    """
    match kind:
        case "binpb":
            dataset = Dataset.FromString(data)
        case "json":
            dataset = json_format.Parse(data, Dataset())
        case "txtpb":
            dataset = text_format.Parse(data.decode(), Dataset())
        case _:
            raise ValueError(kind)
    return dataset


def send_message(message: Message) -> str:
    """Converts a protocol buffer message to a base64-encoded string."""
    return b64encode(message.SerializeToString()).decode()
