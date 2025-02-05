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
import { type ReactionFormNode, ReactionFormNodeType } from 'common/types/reaction/reactionFields';

const booleanOptions = [
  { label: 'UNSPECIFIED', value: undefined },
  { label: 'TRUE', value: true },
  { label: 'FALSE', value: false },
];

export const reactionNotes: Array<ReactionFormNode> = [
  {
    type: ReactionFormNodeType.wrapper,
    grid: 2,
    fields: [
      {
        type: ReactionFormNodeType.select,
        name: 'isHeterogeneous',
        selectType: 'segmented',
        options: booleanOptions,
        wrapperConfig: {
          label: 'In heterogeneous',
        },
      },
      {
        type: ReactionFormNodeType.select,
        name: 'formsPrecipitate',
        selectType: 'segmented',
        options: booleanOptions,
        wrapperConfig: {
          label: 'Forms precipitate',
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
        name: 'isExothermic',
        selectType: 'segmented',
        options: booleanOptions,
        wrapperConfig: {
          label: 'In exothermic',
        },
      },
      {
        type: ReactionFormNodeType.select,
        name: 'offgasses',
        selectType: 'segmented',
        options: booleanOptions,
        wrapperConfig: {
          label: 'Offgasses',
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
        name: 'isSensitiveToOxygen',
        selectType: 'segmented',
        options: booleanOptions,
        wrapperConfig: {
          label: 'Oxygen sensitive',
        },
      },
      {
        type: ReactionFormNodeType.select,
        name: 'isSensitiveToMoisture',
        selectType: 'segmented',
        options: booleanOptions,
        wrapperConfig: {
          label: 'Moisture sensitive',
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
        name: 'isSensitiveToLight',
        selectType: 'segmented',
        options: booleanOptions,
        wrapperConfig: {
          label: 'Light sensitive',
        },
      },
    ],
  },
  {
    type: ReactionFormNodeType.value,
    name: 'safetyNotes',
    wrapperConfig: {
      label: 'Safety notes',
    },
    inputType: 'textarea',
  },
  {
    type: ReactionFormNodeType.value,
    name: 'procedureDetails',
    wrapperConfig: {
      label: 'Procedure details',
    },
    inputType: 'textarea',
  },
];
