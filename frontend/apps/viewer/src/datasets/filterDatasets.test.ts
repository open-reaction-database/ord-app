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
import type { DatasetSummary } from '#api/types.ts';
import { filterDatasets } from '#datasets/filterDatasets.ts';

const DATASETS: Array<DatasetSummary> = [
  {
    dataset_id: 'ord_dataset-1',
    name: 'Suzuki couplings',
    description: 'Pd',
    reactions: 120,
  },
  {
    dataset_id: 'ord_dataset-2',
    name: 'Amide couplings',
    description: 'HATU',
    reactions: 7,
  },
];

describe('filterDatasets', () => {
  it.each([
    ['', ['ord_dataset-1', 'ord_dataset-2']],
    ['  ', ['ord_dataset-1', 'ord_dataset-2']],
    ['suzuki', ['ord_dataset-1']],
    ['COUPLINGS', ['ord_dataset-1', 'ord_dataset-2']],
    ['amide hatu', ['ord_dataset-2']],
    ['amide pd', []],
    ['dataset-2', ['ord_dataset-2']],
    ['120', ['ord_dataset-1']],
  ])('keeps what matches %j', (filter, expected) => {
    expect(filterDatasets(DATASETS, filter).map(dataset => dataset.dataset_id)).toEqual(
      expected,
    );
  });

  it('returns the same array for an empty filter', () => {
    expect(filterDatasets(DATASETS, '')).toBe(DATASETS);
  });
});
