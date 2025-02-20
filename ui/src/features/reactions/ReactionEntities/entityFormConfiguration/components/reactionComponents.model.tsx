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
import { ordMapToKeyValueObject } from 'common/utils/reactionForm/ordMapToKeyValueObject.ts';
import {
  appAmountUnspecified,
  massUnitNames,
  molesUnitNames,
  volumeUnitNames,
} from 'store/entities/reactions/reactionsInputs/reactionsInputs.models.ts';
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid.ts';
import {
  buildUseSelectItems,
  buildUseSelectItemsListFromMap,
} from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { buildUseCreate } from 'features/reactions/ReactionEntities/entityFormConfiguration/inputs/buildUseCreate.ts';
import { reversePrimitiveRecord } from 'common/utils/reversePrimitiveRecord.ts';
import { createEntityListItemComponent } from 'features/reactions/ReactionEntities/entityFormConfiguration/EntityListItem/entityListItem.utils.tsx';
import type { AppData } from 'store/entities/reactions/reactionData/reactionData.types.ts';
import { findReactionEntityUniqueName } from 'features/reactions/ReactionEntities/findReactionEntityUniqueName.ts';
import { ordDataToReactionData } from 'store/entities/reactions/reactionData/reactionData.converters.ts';
import { useMemo } from 'react';
import { AppDataDisplay } from 'features/reactions/ReactionEntities/entityFormConfiguration/AppDataDisplay.tsx';
import { CustomIdentifiers } from './CustomIdentifiers/CustomIdentifiers.tsx';
import type { AppReactionAmount } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';

const reactionRoleOptions = ordMapToKeyValueObject(ord.ReactionRole.ReactionRoleType);

const textureTypeOptions = ordMapToKeyValueObject(ord.Texture.TextureType);

const preparationNameByValue = reversePrimitiveRecord(ord.CompoundPreparation.CompoundPreparationType);

const compareFeatures = (a: AppData, b: AppData): number => a.name.localeCompare(b.name);

const createEmptyFeature = (_: number, features: Array<unknown>): [string, AppData] => {
  const uniqueName = findReactionEntityUniqueName(
    'Feature',
    (features as Array<AppData>).map(f => f.name),
  );
  const feature = ordDataToReactionData(ord.Data.toObject(new ord.Data()), uniqueName);
  return [feature.id, feature];
};

const booleanOptions = [
  { label: 'UNSPECIFIED', value: undefined },
  { label: 'TRUE', value: true },
  { label: 'FALSE', value: false },
];

const appReactionAmountType: Array<string> = [
  appAmountUnspecified,
  ...molesUnitNames,
  ...massUnitNames,
  ...volumeUnitNames,
];

const appReactionAmountOptions = appReactionAmountType.map(item => ({
  label: item,
  value: item,
}));

const emptyPreparation = (newIndex: number): [number, ord.ICompoundPreparation] => {
  return [newIndex, ord.CompoundPreparation.toObject(new ord.CompoundPreparation())];
};

const useSelectIdentifiers = buildUseSelectItems('identifiers');

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
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.vpu,
      name: 'amount',
      options: appReactionAmountOptions,
      wrapperConfig: {
        label: 'Amount',
      },
      select: 'native-inline',
    },
    {
      type: ReactionFormNodeType.select,
      name: 'volumeIncludesSolutes',
      wrapperConfig: {
        label: 'Includes solutes',
      },
      condition: {
        name: 'amount',
        isHidden: (item: unknown) => !volumeUnitNames.includes((item as AppReactionAmount).units),
      },
      options: booleanOptions,
      selectType: 'dropdown',
    },
  ),
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
    getKey: ([index]) => index,
    useSelectItems: function useSelectIdentifiersWrapper() {
      const identifiers: Array<ord.CompoundIdentifier> = useSelectIdentifiers();
      return useMemo(() => {
        return (identifiers || []).reduce((acc: Array<[number, ord.CompoundIdentifier]>, item, index) => {
          const isMoblock = item.type === ord.CompoundIdentifier.CompoundIdentifierType.MOLBLOCK;
          return isMoblock ? acc : acc.concat([[index, item]]);
        }, []);
      }, [identifiers]);
    },
    ItemDisplay: createEntityListItemComponent<[number, ord.ICompoundIdentifier]>({
      entityName: 'identifiers',
      title: 'Identifier',
      requiredFields: [
        {
          label: 'Type',
          render: ([, item]) => identifierKeyByValue[item.type ?? 0],
        },
        {
          label: 'Value',
          render: ([, item]) => item.value,
        },
      ],
    }),
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
      entityName: 'preparations',
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
    useSelectItems: buildUseSelectItemsListFromMap('features', compareFeatures),
    ItemDisplay: createEntityListItemComponent<AppData>({
      entityName: 'features',
      title: item => item.name,
      requiredFields: [
        {
          label: 'Type',
          render: item => item.data.type,
        },
        {
          label: 'Value',
          render: item => <AppDataDisplay appData={item} />,
        },
        {
          label: 'Description',
          render: item => item.description,
        },
      ],
    }),
    addItem: {
      label: 'Feature',
      useCreate: buildUseCreate('features', createEmptyFeature),
    },
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
