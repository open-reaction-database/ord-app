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
import { createElement } from 'react';
import { TextInput } from '@mantine/core';
import { normalizeIds, renderOverBothSources } from './renderOverBothSources.tsx';

describe('renderOverBothSources', () => {
  it('gives Mantine inputs the same random IDs over both sources', () => {
    const [overStatic, overRedux] = renderOverBothSources(
      createElement(TextInput, { label: 'Name' }),
    );
    expect(overStatic).toMatch(/id="mantine-[0-9a-z]+"/);
    expect(overStatic).toBe(overRedux);
  });
});

describe('normalizeIds', () => {
  it('normalizes the React useId forms', () => {
    expect(normalizeIds('«r1» :r2: _r_3_')).toBe('ID ID ID');
  });

  it('leaves Mantine class names and variables alone', () => {
    const html = 'class="mantine-hidden-from-sm" style="--mantine-spacing-xs"';
    expect(normalizeIds(html)).toBe(html);
  });
});
