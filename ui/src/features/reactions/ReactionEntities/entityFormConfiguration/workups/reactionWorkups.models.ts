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
import { type ReactionFormNode, ReactionFormNodeType } from '../../reactionEntities.types.ts';
import {
  timeUnitOptions,
  workupTypeOptions,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.models.ts';
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid.ts';
import { booleanOptions } from '../booleanOptions.ts';
import { amountTypeOptions } from 'store/entities/reactions/reactionAmount/reactionAmount.models.ts';
import { WorkupInput } from './WorkupInput.tsx';
import { reactionStirringCondition, reactionTemperatureCondition } from '../reactionConditions.model.tsx';

export const reactionWorkups: Array<ReactionFormNode> = [
  {
    type: ReactionFormNodeType.select,
    name: 'type',
    selectType: 'dropdown',
    options: workupTypeOptions,
    wrapperConfig: {
      label: 'Type',
    },
  },
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.value,
      name: 'keepPhase',
      inputType: 'string',
      wrapperConfig: {
        label: 'Keep phase',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: 'targetPh',
      inputType: 'number',
      wrapperConfig: {
        label: 'Target PH',
      },
    },
  ),
  {
    type: ReactionFormNodeType.vpu,
    name: 'duration',
    options: timeUnitOptions,
    wrapperConfig: {
      label: 'Duration',
    },
  },
  {
    type: ReactionFormNodeType.wrapper,
    grid: 2,
    fields: [
      {
        type: ReactionFormNodeType.select,
        options: booleanOptions,
        name: 'isAutomated',
        selectType: 'segmented',
        wrapperConfig: {
          label: 'Is automated',
        },
      },
    ],
  },
  {
    type: ReactionFormNodeType.value,
    name: 'details',
    inputType: 'textarea',
    wrapperConfig: {
      label: 'Details',
    },
  },
  {
    type: ReactionFormNodeType.vpu,
    options: amountTypeOptions,
    name: 'amount',
    select: 'native',
    wrapperConfig: {
      label: 'Aliquot amount',
    },
  },
  {
    type: ReactionFormNodeType.custom,
    name: 'input',
    Component: WorkupInput,
  },
  reactionTemperatureCondition,
  reactionStirringCondition,
];
