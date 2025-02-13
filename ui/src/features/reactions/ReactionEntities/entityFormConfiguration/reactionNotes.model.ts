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
import { createBooleanInput } from 'common/utils/reactionForm/createBooleanInput.ts';
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid.ts';

export const reactionNotes: Array<ReactionFormNode> = [
  wrapInputsWithGrid(
    createBooleanInput('isHeterogeneous', { label: 'Is heterogeneous' }),
    createBooleanInput('formsPrecipitate', { label: 'Forms precipitate' }),
  ),
  wrapInputsWithGrid(
    createBooleanInput('isExothermic', { label: 'Is exothermic' }),
    createBooleanInput('offgasses', { label: 'Offgasses' }),
  ),
  wrapInputsWithGrid(
    createBooleanInput('isSensitiveToOxygen', { label: 'Oxygen sensitive' }),
    createBooleanInput('isSensitiveToMoisture', { label: 'Moisture sensitive' }),
  ),
  {
    type: ReactionFormNodeType.wrapper,
    grid: 2,
    fields: [createBooleanInput('isSensitiveToLight', { label: 'Light sensitive' })],
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
