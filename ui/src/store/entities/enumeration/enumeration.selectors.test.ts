/*
 * Copyright 2026 Open Reaction Database Project Authors
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
import { describe, it, expect } from 'vitest';
import { selectEnumerationProgress } from './enumeration.selectors.ts';
import type { EnumerationProgress } from './enumeration.types.ts';
import type { AppState } from '../../configureAppStore.ts';

const buildState = (enumerationProgress: EnumerationProgress | null): AppState =>
  ({ entities: { enumeration: { enumerationProgress } } }) as unknown as AppState;

describe('selectEnumerationProgress', () => {
  it('returns null when no enumeration is running', () => {
    expect(selectEnumerationProgress(buildState(null))).toBeNull();
  });

  it('returns the current progress object', () => {
    const progress = { index: 5, finished: false, resultDatasetId: null } as EnumerationProgress;
    expect(selectEnumerationProgress(buildState(progress))).toBe(progress);
  });
});
