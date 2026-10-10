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
import { selectReactionPathComponentsList } from './reactionForm.selectors.ts';
import type { AppState } from 'store/configureAppStore.ts';

const buildState = (reactionPathComponentsList: unknown): AppState =>
  ({
    features: { reactionForm: { reactionPathComponentsList } },
  }) as unknown as AppState;

describe('selectReactionPathComponentsList', () => {
  it('returns the path-components list from the slice', () => {
    const list = [['inputs', 'i1']];
    expect(selectReactionPathComponentsList(buildState(list))).toBe(list);
  });

  it('returns an empty list when nothing is open', () => {
    expect(selectReactionPathComponentsList(buildState([]))).toEqual([]);
  });
});
