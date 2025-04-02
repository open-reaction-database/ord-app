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

export const recordModified: Array<ReactionFormNode> = [
  {
    type: ReactionFormNodeType.dateTime,
    name: 'time',
    wrapperConfig: {
      label: 'Time',
    },
  },
  {
    type: ReactionFormNodeType.wrapper,
    grid: 2,
    fields: [
      {
        type: ReactionFormNodeType.value,
        name: 'person.username',
        inputType: 'string',
        wrapperConfig: {
          label: 'Person name',
        },
      },
      {
        type: ReactionFormNodeType.value,
        name: 'person.email',
        inputType: 'string',
        wrapperConfig: {
          label: 'Person e-mail',
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
];
