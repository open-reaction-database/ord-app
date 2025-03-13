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
  ReactionFormNodeType,
  type ReactionFormNode,
} from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid.ts';
import { createBooleanInput } from 'common/utils/reactionForm/createBooleanInput.ts';
import { amountTypeOptions } from 'store/entities/reactions/reactionAmount/reactionAmount.models.ts';
import { textureDetails } from './reactionComponentsBase.model.tsx';

const amountTypeOptionsWithoutVolume = amountTypeOptions.filter(
  item => typeof item !== 'object' || item.group !== 'Moles',
);

export const reactionCrudeComponents: Array<ReactionFormNode> = [
  {
    type: ReactionFormNodeType.wrapper,
    grid: 2,
    fields: [
      {
        type: ReactionFormNodeType.value,
        name: 'reactionId',
        inputType: 'string',
        wrapperConfig: {
          label: 'Reaction ID',
        },
      },
    ],
  },
  wrapInputsWithGrid(
    createBooleanInput('includesWorkup', { label: 'Includes workup' }),
    createBooleanInput('hasDerivedAmount', { label: 'Has derived amount' }),
  ),
  {
    type: ReactionFormNodeType.vpu,
    name: 'amount',
    options: amountTypeOptionsWithoutVolume,
    select: 'native',
    wrapperConfig: {
      label: 'Amount',
    },
  },
  textureDetails,
];
