/*
 * Copyright 2024 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  type ReactionFormNode,
  ReactionFormNodeType,
} from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { createEntityListItemComponent } from 'features/reactions/ReactionEntities/entityFormConfiguration/EntityListItem/entityListItem.utils.tsx';
import { AppDataType, type AppData } from 'store/entities/reactions/reactionData/reactionData.types.ts';
import { AppDataDisplay } from 'features/reactions/ReactionEntities/entityFormConfiguration/AppDataDisplay.tsx';
import { buildUseCreate } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import { findReactionEntityUniqueName } from 'features/reactions/ReactionEntities/findReactionEntityUniqueName.ts';
import { ordDataToReactionData } from 'store/entities/reactions/reactionData/reactionData.converters.ts';
import { ord } from 'ord-schema-protobufjs';

export const reactionDataWithoutName: Array<ReactionFormNode> = [
  {
    type: ReactionFormNodeType.data,
  },
  {
    type: ReactionFormNodeType.value,
    inputType: 'textarea',
    name: 'description',
    wrapperConfig: {
      label: 'Description',
    },
  },
];

export const reactionDataDisplayWithoutName = (entityField: string) =>
  createEntityListItemComponent<AppData>({
    entityField: entityField,
    title: () => 'Data',
    requiredFields: [
      {
        label: 'Type',
        render: item => item.data.type,
      },
      {
        label: 'Value',
        render: item => <AppDataDisplay appData={item} />,
      },
    ],
    optionalFields: [
      {
        label: 'Description',
        render: item => item.description,
      },
    ],
  });

const buildCreateEmptyData =
  (entityName: string) =>
  (_: number, dataList: Array<unknown>): [string, AppData] => {
    const uniqueName = findReactionEntityUniqueName(
      entityName,
      (dataList as Array<AppData>).map(f => f.name),
    );
    const data = ordDataToReactionData(ord.Data.toObject(new ord.Data()), uniqueName);
    if (!data.data?.type) {
      data.data = {
        type: AppDataType.Text,
        value: '',
        format: null,
      };
    }
    return [data.id, data];
  };

export const createReactionDataAddItem = (entityField: string, entityName: string) => ({
  label: entityName,
  useCreate: buildUseCreate(entityField, buildCreateEmptyData(entityName)),
});
