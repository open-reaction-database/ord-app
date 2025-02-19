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
import { ord } from 'ord-schema-protobufjs';
import { ordMapToKeyValueObject } from 'common/utils/reactionForm/ordMapToKeyValueObject.ts';

const identifierTypeOptions = ordMapToKeyValueObject(ord.CompoundIdentifier.CompoundIdentifierType).filter(
  item => item.label !== 'MOLBLOCK',
);

export const reactionComponentIdentifiers: Array<ReactionFormNode> = [
  {
    type: ReactionFormNodeType.select,
    options: identifierTypeOptions,
    name: 'type',
    selectType: 'dropdown',
    wrapperConfig: {
      label: 'Type',
    },
  },
  {
    type: ReactionFormNodeType.value,
    name: 'value',
    inputType: 'string',
    wrapperConfig: {
      label: 'Value',
    },
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
