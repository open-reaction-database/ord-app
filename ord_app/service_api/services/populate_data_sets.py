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
from sqlalchemy.ext.asyncio import AsyncSession

from ord_app.service_api.models import DatasetGroupAssociationModel, DatasetModel, ReactionModel, UserModel
from ord_app.service_api.settings import RuntimeSettings


async def populate_testing_data(db_session: AsyncSession, user: UserModel, group_id: int):
    insert_data = []

    for filename in glob(str(RuntimeSettings.base_dir.parent / "tests" / "testdata" / "*.txtpb")):
        with open(filename, "r") as f:
            dataset_pb = text_format.Parse(f.read(), Dataset())

            dataset = DatasetModel(name=dataset_pb.name, owner=user)
            db_session.add(dataset)
            await db_session.flush()
            dataset_group_association = DatasetGroupAssociationModel(dataset_id=dataset.id, group_id=group_id)
            insert_data.append(dataset_group_association)

            for reaction in dataset_pb.reactions:
                insert_data.append(
                    ReactionModel(
                        name=reaction.reaction_id,
                        binpb=reaction.SerializeToString(),
                        dataset=dataset,
                        owner=user,
                        group_id=group_id,
                    )
                )

    db_session.add_all(insert_data)
    await db_session.commit()
