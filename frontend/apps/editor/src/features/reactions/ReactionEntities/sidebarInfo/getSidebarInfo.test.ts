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
import { getSidebarInfo } from './getSidebarInfo.tsx';

describe('getSidebarInfo', () => {
  it('resolves a top-level entity path to its sidebar info', () => {
    expect(getSidebarInfo(['inputs']).label).toBe('Input');
    expect(getSidebarInfo(['outcomes']).label).toBe('Outcomes');
    expect(getSidebarInfo(['identifiers']).label).toBe('Identifier');
  });

  it('recurses to later segments when the first segment is ambiguous', () => {
    // "identifiers" alone matches several entries (component/molblock/product identifiers), so the
    // match must narrow on the following segments to reach the component-identifiers entry.
    const info = getSidebarInfo(['identifiers', 'products', 'outcomes']);
    expect(info.label).toBe('Identifiers');
    expect(typeof info.sidebarTitle).toBe('function');
  });

  it('skips numeric indices interleaved in a concrete reaction path', () => {
    // Same ambiguous-first-segment path, but with numeric ids between entities — they must be
    // skipped at each recursion step to still resolve to the component-identifiers entry.
    expect(getSidebarInfo(['identifiers', 0, 'products', 1, 'outcomes']).label).toBe(
      'Identifiers',
    );
  });
});
