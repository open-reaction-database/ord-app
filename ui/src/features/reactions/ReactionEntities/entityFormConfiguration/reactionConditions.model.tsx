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
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid';
import { type ReactionFormNode, ReactionFormNodeType } from '../reactionEntities.types';
import { booleanOptions } from './booleanOptions';
import {
  reactionIdentifierTypeOptions,
  stirringRateOptions,
  temperatureOptions,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.models';

export const reactionConditions: Array<ReactionFormNode> = [
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.select,
      name: 'reflux',
      selectType: 'segmented',
      options: booleanOptions,
      wrapperConfig: {
        label: 'Reflux',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: 'ph',
      inputType: 'number',
      wrapperConfig: {
        label: 'pH',
      },
    },
    {
      type: ReactionFormNodeType.select,
      name: 'conditionsAreDynamic',
      selectType: 'segmented',
      options: booleanOptions,
      wrapperConfig: {
        label: 'Dinamic Conditions',
      },
    },
  ),
  {
    type: ReactionFormNodeType.value,
    name: 'details',
    inputType: 'textarea',
    wrapperConfig: {
      label: 'Details',
      hint: 'Elaboration on the aspects of the reaction conditions that cannot be captured by this schema in a structured format.',
    },
  },
  {
    type: ReactionFormNodeType.block,
    title: {
      label: 'Temperature',
    },
    fields: [
      wrapInputsWithGrid(
        {
          type: ReactionFormNodeType.select,
          name: 'control',
          selectType: 'dropdown',
          options: reactionIdentifierTypeOptions,
          wrapperConfig: {
            label: 'Control',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: 'details',
          inputType: 'string',
          wrapperConfig: {
            label: 'Details',
          },
        },
      ),
      {
        type: ReactionFormNodeType.vpu,
        name: 'temperature',
        wrapperConfig: {
          label: 'Setpoint',
          hint: 'Addition temperature specifies if the reaction input was heated or cooled prior to addition',
        },
        options: temperatureOptions,
      },
    ],
  },
  {
    type: ReactionFormNodeType.block,
    title: {
      label: 'Temperature',
    },
    fields: [
      wrapInputsWithGrid(
        {
          type: ReactionFormNodeType.select,
          name: 'method',
          selectType: 'dropdown',
          options: reactionIdentifierTypeOptions,
          wrapperConfig: {
            label: 'Method',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: 'details',
          inputType: 'string',
          wrapperConfig: {
            label: 'Details',
          },
        },
      ),
      wrapInputsWithGrid(
        {
          type: ReactionFormNodeType.select,
          name: 'rate',
          selectType: 'segmented',
          options: stirringRateOptions,
          wrapperConfig: {
            label: 'Rate',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: 'details',
          inputType: 'string',
          wrapperConfig: {
            label: 'Details',
          },
        },
      ),
      {
        type: ReactionFormNodeType.wrapper,
        grid: 2,
        fields: [
          {
            type: ReactionFormNodeType.value,
            name: 'rpm',
            inputType: 'string',
            wrapperConfig: {
              label: 'RpM',
            },
          },
        ],
      },
    ],
  },
];
