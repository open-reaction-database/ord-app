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

from ord_app.service_api.models import UserModel, DatasetModel
from ord_app.service_api.services.postgresql import db_session_maker
from ord_app.service_api.settings import RuntimeSettings


TEST_USER_ID = "680b0d9fe649417cb092d790907bd5a5"

async def populate_testing_data():

    user_values = {"user_id": TEST_USER_ID, "user_name": "test"}
    user_stmt = insert(UserModel).values(user_values).on_conflict_do_nothing()

    async with db_session_maker() as session:
        for filename in glob(str(RuntimeSettings.base_dir/"editor"/"testdata"/"*.txtpb")):
            with open(filename, "r") as f:
                dataset = text_format.Parse(f.read(), Dataset())

                values = {
                    "user_id": TEST_USER_ID,
                    "dataset_name": dataset.name,
                    "binpb": dataset.SerializeToString()
                }

                stmt = insert(DatasetModel).values(values).on_conflict_do_update(
                    index_elements=['user_id', 'dataset_name'],
                    set_={"binpb": values["binpb"]},
                )
                await session.execute(stmt)

        await session.execute(user_stmt)
        await session.commit()
