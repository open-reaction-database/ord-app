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
  environmentTypeOptions,
  vesselMaterialTypeOptions,
  vesselTypeOptions,
  volumeTypeOptions,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.models';
import { ReactionFormNodeType, type ReactionFormNode } from '../../reactionEntities.types';
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid';
import { booleanOptions } from '../booleanOptions';

export const reactionSetup: Array<ReactionFormNode> = [
  {
    type: ReactionFormNodeType.wrapper,
    grid: 2,
    fields: [
      {
        type: ReactionFormNodeType.select,
        name: 'vessel',
        selectType: 'dropdown',
        options: vesselTypeOptions,
        wrapperConfig: {
          label: 'Vessel',
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
    ],
  },
  {
    type: ReactionFormNodeType.wrapper,
    grid: 2,
    fields: [
      {
        type: ReactionFormNodeType.select,
        name: 'material',
        selectType: 'dropdown',
        options: vesselMaterialTypeOptions,
        wrapperConfig: {
          label: 'Material',
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
    ],
  },
  wrapInputsWithGrid({
    type: ReactionFormNodeType.vpu,
    name: 'volume',
    options: volumeTypeOptions,
    wrapperConfig: {
      label: 'Volume',
    },
    select: 'native-inline',
  }),
  {
    type: ReactionFormNodeType.wrapper,
    grid: 2,
    fields: [
      {
        type: ReactionFormNodeType.select,
        name: 'automated',
        selectType: 'segmented',
        options: booleanOptions,
        wrapperConfig: {
          label: 'Automated',
          hint: 'Whether the reaction conditions cannot be fully described by the fields in this schema/form.',
        },
      },
    ],
  },
  {
    type: ReactionFormNodeType.wrapper,
    grid: 2,
    fields: [
      {
        type: ReactionFormNodeType.select,
        name: 'environment',
        selectType: 'dropdown',
        options: environmentTypeOptions,
        wrapperConfig: {
          label: 'Environment',
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
    ],
  },
];
