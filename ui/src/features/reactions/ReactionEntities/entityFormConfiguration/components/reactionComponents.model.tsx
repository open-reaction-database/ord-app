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
import { ord } from 'ord-schema-protobufjs';
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid.ts';
import { buildUseSelectItems } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { buildUseCreate } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import { createEntityListItemComponent } from 'features/reactions/ReactionEntities/entityFormConfiguration/EntityListItem/entityListItem.utils.tsx';
import { booleanOptions } from '../booleanOptions.ts';
import { reactionAmounts } from 'features/reactions/ReactionEntities/entityFormConfiguration/amount/reactionAmounts.models.ts';
import { reactionRoleOptions } from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.models.ts';
import { featuresList, identifiersList, molBlockIdentifiers, textureDetails } from './reactionComponentsBase.model.tsx';
import type { ReactionRole } from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.types.ts';

const emptyPreparation = (newIndex: number): [number, ord.ICompoundPreparation] => {
  return [newIndex, ord.CompoundPreparation.toObject(new ord.CompoundPreparation())];
};

export const reactionComponents: Array<ReactionFormNode> = [
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
        name: 'isLimiting',
        selectType: 'dropdown',
        options: booleanOptions,
        wrapperConfig: {
          label: 'Limiting reactant',
        },
        condition: {
          name: 'reactionRole',
          isHidden: reactionRole => (reactionRole as ReactionRole) !== 'REACTANT',
        },
      },
    ],
  },
  ...reactionAmounts,
  molBlockIdentifiers,
  identifiersList,
  {
    type: ReactionFormNodeType.block,
    title: {
      label: 'Source',
    },
    fields: [
      {
        type: ReactionFormNodeType.objectInitializer,
        name: 'source',
        field: wrapInputsWithGrid(
          {
            type: ReactionFormNodeType.value,
            name: 'source.vendor',
            wrapperConfig: {
              label: 'Vendor',
            },
            inputType: 'string',
          },
          {
            type: ReactionFormNodeType.value,
            name: 'source.catalogId',
            wrapperConfig: {
              label: 'Catalog ID',
            },
            inputType: 'string',
          },
          {
            type: ReactionFormNodeType.value,
            name: 'source.lot',
            wrapperConfig: {
              label: 'Lot number',
            },
            inputType: 'string',
          },
        ),
      },
    ],
  },
  {
    type: ReactionFormNodeType.list,
    title: {
      label: 'Preparations',
    },
    getKey: (_, index) => index,
    useSelectItems: buildUseSelectItems('preparations'),
    ItemDisplay: createEntityListItemComponent<ord.CompoundPreparation>({
      entityField: 'preparations',
      title: 'Preparation',
      requiredFields: [
        {
          label: 'Type',
          render: item => item.type,
        },
        {
          label: 'Details',
          render: item => item.details,
        },
      ],
    }),
    addItem: {
      label: 'Preparation',
      useCreate: buildUseCreate('preparations', emptyPreparation),
    },
  },
  featuresList,
  textureDetails,
];
