/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, it, expect } from 'vitest';
import { createBooleanInput } from './createBooleanInput.ts';
import {
  ReactionFormNodeType,
  type ReactionFormSelect,
} from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { booleanOptions } from 'features/reactions/ReactionEntities/entityFormConfiguration/booleanOptions.ts';

describe('createBooleanInput', () => {
  it('builds a segmented select node from the shared boolean options', () => {
    const wrapperConfig = { label: 'Exothermic?' } as ReactionFormSelect['wrapperConfig'];
    expect(createBooleanInput('isExothermic', wrapperConfig)).toEqual({
      type: ReactionFormNodeType.select,
      name: 'isExothermic',
      selectType: 'segmented',
      options: booleanOptions,
      wrapperConfig,
    });
  });
});
