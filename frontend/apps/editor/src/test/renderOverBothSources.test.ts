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
import { describe, expect, it } from 'vitest';
import { normalizeIds } from './renderOverBothSources.tsx';

describe('normalizeIds', () => {
  it('normalizes Mantine random IDs of any length, with their suffixes', () => {
    // Mantine takes up to nine base-36 digits of Math.random(), and fewer when it has fewer.
    expect(normalizeIds('id="mantine-a1b2c3d4e" for="mantine-a1b2c3d4e-label"')).toBe(
      normalizeIds('id="mantine-k3j2" for="mantine-k3j2-label"'),
    );
  });

  it('normalizes the React useId forms', () => {
    expect(normalizeIds('«r1» :r2: _r_3_')).toBe('ID ID ID');
  });
});
