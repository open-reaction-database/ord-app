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
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid.ts';
import { buildUseSelectItemsListFromMap } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import type { AppData } from 'store/entities/reactions/reactionData/reactionData.types.ts';
import { booleanOptions } from '../booleanOptions.ts';
import {
  createReactionDataAddItem,
  reactionDataDisplay,
} from 'features/reactions/ReactionEntities/entityFormConfiguration/data/reactionData.models.tsx';
import { compareNamedEntities } from 'features/reactions/ReactionEntities/entityFormConfiguration/compareNamedEntities.ts';
import { analysisOptions } from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.models.ts';

export const reactionAnalyses: Array<ReactionFormNode> = [
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.value,
      name: 'name',
      inputType: 'string',
      wrapperConfig: {
        label: 'Analysis name',
        cannotBeVariable: true,
      },
    },
    {
      type: ReactionFormNodeType.select,
      name: 'type',
      options: analysisOptions,
      selectType: 'dropdown',
      wrapperConfig: {
        label: 'Type',
      },
    },
  ),
  {
    type: ReactionFormNodeType.value,
    name: 'details',
    inputType: 'textarea',
    wrapperConfig: {
      label: 'Details',
    },
  },
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.value,
      name: 'chmoId',
      inputType: 'number',
      wrapperConfig: {
        label: 'Chmo ID',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: 'instrumentManufacturer',
      inputType: 'string',
      wrapperConfig: {
        label: 'Instrument manufacturer',
      },
    },
    {
      type: ReactionFormNodeType.date,
      name: 'instrumentLastCalibrated',
      wrapperConfig: {
        label: 'Instrument calibration date',
      },
    },
  ),
  {
    type: ReactionFormNodeType.wrapper,
    grid: 3,
    fields: [
      {
        type: ReactionFormNodeType.select,
        name: 'isOfIsolatedSpecies',
        selectType: 'segmented',
        wrapperConfig: {
          label: 'Is of isolated species',
          hint: 'Whether this analysis is intended to be of an isolated species. If false or unspecified, the assumption is that it is of a crude product mixture (or a partially worked-up product mixture).',
        },
        options: booleanOptions,
      },
    ],
  },
  {
    type: ReactionFormNodeType.list,
    name: 'analysisData',
    useSelectItems: buildUseSelectItemsListFromMap('analysisData', compareNamedEntities),
    getKey: (item: AppData) => item.id,
    title: {
      label: 'Analytical Data',
    },
    ItemDisplay: reactionDataDisplay('analysisData'),
    addItem: createReactionDataAddItem('analysisData', 'Analytical Data'),
  },
];
