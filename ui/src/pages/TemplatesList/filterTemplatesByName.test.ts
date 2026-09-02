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
import { filterTemplatesByName } from './filterTemplatesByName.ts';

const order = ['template_1', 'template_2', 'template_3'];
const byId = {
  template_1: { name: 'benzaldehyde coupling' },
  template_2: { name: 'Suzuki Cross-Coupling' },
  template_3: { name: 'amide formation' },
};

describe('filterTemplatesByName', () => {
  it('returns the full order when the query is empty', () => {
    expect(filterTemplatesByName(order, byId, '')).toEqual(order);
  });

  it('returns the full order when the query is whitespace-only', () => {
    expect(filterTemplatesByName(order, byId, '   ')).toEqual(order);
  });

  it('filters by case-insensitive substring on name', () => {
    expect(filterTemplatesByName(order, byId, 'BENZ')).toEqual(['template_1']);
    expect(filterTemplatesByName(order, byId, 'coupling')).toEqual([
      'template_1',
      'template_2',
    ]);
    expect(filterTemplatesByName(order, byId, 'suzuki')).toEqual(['template_2']);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterTemplatesByName(order, byId, 'zzzz')).toEqual([]);
  });

  it('skips ids missing from templatesById', () => {
    expect(
      filterTemplatesByName(['template_1', 'template_missing'], byId, 'benz'),
    ).toEqual(['template_1']);
  });

  it('skips ids whose name is not a string', () => {
    const withBad = {
      ...byId,
      template_bad: { name: undefined },
      template_null: {} as { name?: string },
    };
    expect(
      filterTemplatesByName(
        ['template_1', 'template_bad', 'template_null'],
        withBad,
        'benz',
      ),
    ).toEqual(['template_1']);
  });
});
