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
import {
  buildUseSelectItems,
  buildUseSelectItemsListFromMap,
} from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { buildUseCreate } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import { reversePrimitiveRecord } from 'common/utils/reversePrimitiveRecord.ts';
import { createEntityListItemComponent } from 'features/reactions/ReactionEntities/entityFormConfiguration/EntityListItem/entityListItem.utils.tsx';
import type { AppData } from 'store/entities/reactions/reactionData/reactionData.types.ts';
import { CustomIdentifiers } from './CustomIdentifiers/CustomIdentifiers.tsx';
import { booleanOptions } from '../booleanOptions.ts';
import {
  createReactionDataAddItem,
  reactionDataDisplay,
} from 'features/reactions/ReactionEntities/entityFormConfiguration/data/reactionData.models.tsx';
import { compareNamedEntities } from 'features/reactions/ReactionEntities/entityFormConfiguration/compareNamedEntities.ts';
import { reactionAmounts } from 'features/reactions/ReactionEntities/entityFormConfiguration/amount/reactionAmounts.models.ts';
import {
  reactionRoleOptions,
  textureTypeOptions,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.models.ts';

const preparationNameByValue = reversePrimitiveRecord(ord.CompoundPreparation.CompoundPreparationType);

const emptyPreparation = (newIndex: number): [number, ord.ICompoundPreparation] => {
  return [newIndex, ord.CompoundPreparation.toObject(new ord.CompoundPreparation())];
};

const identifierKeyByValue = reversePrimitiveRecord(ord.CompoundIdentifier.CompoundIdentifierType);

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
          isHidden: reactionRole => (reactionRole as number) !== ord.ReactionRole.ReactionRoleType.REACTANT,
        },
      },
    ],
  },
  ...reactionAmounts,
  {
    type: ReactionFormNodeType.custom,
    name: 'customIdentifiers',
    Component: CustomIdentifiers,
  },
  {
    type: ReactionFormNodeType.list,
    title: {
      label: 'Identifiers',
    },
    getKey: (_, index) => index,
    useSelectItems: buildUseSelectItems('identifiers'),
    ItemDisplay: createEntityListItemComponent<ord.ICompoundIdentifier>({
      entityField: 'identifiers',
      title: 'Identifier',
      requiredFields: [
        {
          label: 'Type',
          render: item => identifierKeyByValue[item.type ?? 0],
        },
        {
          label: 'Value',
          render: item => item.value,
        },
      ],
    }),
    addItem: {
      label: 'Identifier',
      useCreate: buildUseCreate('identifiers', index => {
        const emptyItem = ord.CompoundIdentifier.toObject(new ord.CompoundIdentifier());
        return [index, emptyItem];
      }),
    },
  },
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
          render: item => preparationNameByValue[item.type ?? 0],
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
  {
    type: ReactionFormNodeType.list,
    title: {
      label: 'Features',
    },
    getKey: (item: AppData) => item.id,
    useSelectItems: buildUseSelectItemsListFromMap('features', compareNamedEntities),
    ItemDisplay: reactionDataDisplay('features'),
    addItem: createReactionDataAddItem('features', 'Feature'),
  },
  {
    type: ReactionFormNodeType.block,
    title: {
      label: 'Isolated Product Characteristics',
    },
    fields: [
      {
        type: ReactionFormNodeType.objectInitializer,
        name: 'texture',
        field: wrapInputsWithGrid(
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
      },
    ],
  },
];
