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
import { ComponentsKetcherEditor } from 'features/reactions/ReactionEntities/entityFormConfiguration/components/ComponentsKetcherEditor/ComponentsKetcherEditor.tsx';
import {
  appAmountUnspecified,
  massUnitNames,
  molesUnitNames,
  volumeUnitNames,
} from 'store/entities/reactions/reactionsInputs/reactionsInputs.models.ts';
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid.ts';

const reactionRoleOptions = ordMapToKeyValueObject(ord.ReactionRole.ReactionRoleType);

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
  {
    type: ReactionFormNodeType.vpu,
    name: 'amount',
    options: appReactionAmountOptions,
    wrapperConfig: {
      label: 'Amount',
    },
    useNativeSelect: true,
  },
  {
    type: ReactionFormNodeType.custom,
    name: 'ketcher',
    useSelectData: () => {},
    Component: ComponentsKetcherEditor,
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
];
