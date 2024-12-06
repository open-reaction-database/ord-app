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

from glob import glob

from google.protobuf import text_format
from ord_schema.proto.dataset_pb2 import Dataset
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.models import DatasetModel, UserModel
from ord_app.service_api.services.postgresql import db_session_maker
from ord_app.service_api.settings import RuntimeSettings


async def populate_testing_data(db_session: AsyncSession, user: UserModel):
    datasets = []

    for filename in glob(str(RuntimeSettings.base_dir.parent / "tests" / "testdata" / "*.txtpb")):
        with open(filename, "r") as f:
            dataset_proto = text_format.Parse(f.read(), Dataset())

            datasets.append(DatasetModel(name=dataset_proto.name, binpb=dataset_proto.SerializeToString(), user=user))

    db_session.add_all(datasets)
    await db_session.commit()
