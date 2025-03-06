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
import {
  reactionRoleOptions,
  textureTypeOptions,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.models.ts';
import type { ReactionRole } from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.types.ts';
import { booleanOptions } from 'features/reactions/ReactionEntities/entityFormConfiguration/booleanOptions.ts';
import {
  featuresList,
  identifiersList,
  molBlockIdentifiers,
} from 'features/reactions/ReactionEntities/entityFormConfiguration/components/reactionComponentsBase.model.tsx';
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid.ts';
import type { ReactionMeasurement } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { buildUseSelectItems } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { createEntityListItemComponent } from 'features/reactions/ReactionEntities/entityFormConfiguration/EntityListItem/entityListItem.utils.tsx';
import { buildUseCreate } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import { ord } from 'ord-schema-protobufjs';
import { ordMeasurementToReaction } from 'store/entities/reactions/reactionComponent/reactionComponent.converters.ts';

export const reactionProducts: Array<ReactionFormNode> = [
  {
    type: ReactionFormNodeType.wrapper,
    grid: 2,
    fields: [
      {
        type: ReactionFormNodeType.select,
        name: 'reactionRole',
        selectType: 'dropdown',
        options: reactionRoleOptions,
        wrapperConfig: {
          label: 'Reaction role',
        },
      },
      {
        type: ReactionFormNodeType.select,
        name: 'isDesiredProduct',
        selectType: 'dropdown',
        options: booleanOptions,
        wrapperConfig: {
          label: 'Desired product',
          hint: 'Whether this is the desired product.',
        },
        condition: {
          name: 'reactionRole',
          isHidden: reactionRole => (reactionRole as ReactionRole) !== 'PRODUCT',
        },
      },
    ],
  },
  molBlockIdentifiers,
  identifiersList,
  {
    type: ReactionFormNodeType.list,
    title: {
      label: 'Measurements',
    },
    getKey: (_: ReactionMeasurement, index) => index,
    useSelectItems: buildUseSelectItems('measurements'),
    ItemDisplay: createEntityListItemComponent<ReactionMeasurement>({
      entityField: 'measurements',
      title: 'Measurement',
      requiredFields: [
        {
          label: 'Type',
          render: item => item.type,
        },
        {
          label: 'Based on',
          render: item => item.analysis?.name,
        },
      ],
    }),
    addItem: {
      label: 'Measurement',
      useCreate: buildUseCreate('measurements', index => {
        const newMeasurement = ordMeasurementToReaction(ord.ProductMeasurement.toObject(new ord.ProductMeasurement()));
        return [index, newMeasurement];
      }),
    },
  },
  featuresList,
  {
    type: ReactionFormNodeType.block,
    title: {
      label: 'Isolated Product Characteristics',
    },
    fields: [
      wrapInputsWithGrid(
        {
          type: ReactionFormNodeType.value,
          name: 'isolatedColor',
          inputType: 'string',
          wrapperConfig: {
            label: 'Color',
          },
        },
        {
          type: ReactionFormNodeType.select,
          name: 'texture.type',
          selectType: 'dropdown',
          options: textureTypeOptions,
          wrapperConfig: {
            label: 'Texture',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: 'texture.details',
          inputType: 'string',
          wrapperConfig: {
            label: 'Texture details',
          },
        },
      ),
    ],
  },
];
