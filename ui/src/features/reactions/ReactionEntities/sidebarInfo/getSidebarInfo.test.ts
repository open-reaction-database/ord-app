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

  it('recursively narrows a nested path to the matching entry', () => {
    // products live under outcomes; the two-segment path must resolve to the Products entry.
    const info = getSidebarInfo(['products', 'outcomes']);
    expect(info.label).toBe('Products');
    expect(typeof info.sidebarTitle).toBe('function');
  });

  it('skips numeric indices when matching the path', () => {
    // A concrete reaction path interleaves numeric ids, which must be ignored during matching.
    expect(getSidebarInfo(['products', 0, 'outcomes', 1]).label).toBe('Products');
  });
});
