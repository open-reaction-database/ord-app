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
import { createSelectorFactory } from './createSelectorFactory.ts';
import type { AppState } from '../configureAppStore.ts';

interface Slice {
  count: number;
  name: string;
}

const slice: Slice = { count: 3, name: 'set' };
const state = { features: { errorPage: slice } } as unknown as AppState;
const selectRoot = (s: AppState) =>
  (s as unknown as { features: { errorPage: Slice } }).features.errorPage;

describe('createSelectorFactory', () => {
  const { buildSelector } = createSelectorFactory(selectRoot);

  it('builds selectors that read a leaf through the chosen root slice', () => {
    expect(buildSelector((s: Slice) => s.count)(state)).toBe(3);
    expect(buildSelector((s: Slice) => s.name)(state)).toBe('set');
  });

  it('passes the whole root slice through when the leaf selector is identity', () => {
    expect(buildSelector(s => s)(state)).toBe(slice);
  });
});
