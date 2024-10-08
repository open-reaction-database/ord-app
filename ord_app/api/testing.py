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

"""Testing utilities."""
import os
from glob import glob

import psycopg
from google.protobuf import text_format
from ord_schema.proto.dataset_pb2 import Dataset

from ord_app.api.database import add_dataset, add_user, prepare_database

TEST_USER_ID = "680b0d9fe649417cb092d790907bd5a5"


def setup_test_postgres(url: str) -> None:
    """Adds test data to a postgres database."""
    datasets = []
    for filename in glob(os.path.join(os.path.dirname(__file__), "editor", "testdata", "*.txtpb")):
        with open(filename) as f:
            datasets.append(text_format.Parse(f.read(), Dataset()))
    assert datasets
    with psycopg.connect(url) as connection, connection.cursor() as cursor:  # pylint: disable=not-context-manager
        prepare_database(cursor)
        add_user(TEST_USER_ID, "test", cursor)
        for dataset in datasets:
            add_dataset(TEST_USER_ID, dataset, cursor)
