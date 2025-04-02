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

export const recordModified: Array<ReactionFormNode> = [
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.dateTime,
      name: 'time',
      wrapperConfig: {
        label: 'Time',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: 'person.username',
      inputType: 'string',
      wrapperConfig: {
        label: 'Username',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: 'person.name',
      inputType: 'string',
      wrapperConfig: {
        label: 'Name',
      },
    },
  ),
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.value,
      name: 'person.email',
      inputType: 'string',
      wrapperConfig: {
        label: 'Email',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: 'person.orcid',
      inputType: 'string',
      wrapperConfig: {
        label: 'Name',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: 'person.organization',
      inputType: 'string',
      wrapperConfig: {
        label: 'Organization',
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
];
