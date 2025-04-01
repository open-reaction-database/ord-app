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
import { ReactionFormNodeType, type ReactionFormNode } from '../reactionEntities.types';
import { timeTypeOptions } from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.models';

export const reactionObservations: Array<ReactionFormNode> = [
  {
    type: ReactionFormNodeType.vpu,
    name: 'time',
    wrapperConfig: {
      label: 'Time',
    },
    options: timeTypeOptions,
  },
  {
    type: ReactionFormNodeType.value,
    name: 'comment',
    inputType: 'string',
    wrapperConfig: {
      label: 'Comment',
    },
  },
  {
    type: ReactionFormNodeType.data,
    fieldName: 'image.data',
    nameFieldName: 'image.name',
  },
  {
    type: ReactionFormNodeType.value,
    inputType: 'textarea',
    name: 'image.description',
    wrapperConfig: {
      label: 'Description',
    },
  },
];
