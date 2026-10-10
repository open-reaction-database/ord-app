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
import {
  selectIsReactionLookupOpen,
  selectReactionLookupIsLoading,
  selectHasReactionLookupError,
} from './reactionLookup.selectors.ts';
import type { AppState } from 'store/configureAppStore.ts';

const buildState = (reactionLookup: Record<string, unknown>): AppState =>
  ({ features: { reactionLookup } }) as unknown as AppState;

const state = buildState({ isOpened: true, isLoading: false, hasError: true });

describe('reactionLookup selectors', () => {
  it('selectIsReactionLookupOpen reads the isOpened flag', () => {
    expect(selectIsReactionLookupOpen(state)).toBe(true);
  });

  it('selectReactionLookupIsLoading reads the isLoading flag', () => {
    expect(selectReactionLookupIsLoading(state)).toBe(false);
  });

  it('selectHasReactionLookupError reads the hasError flag', () => {
    expect(selectHasReactionLookupError(state)).toBe(true);
  });
});
