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
  selectDatasets,
  selectAreDatasetsLoading,
  selectDatasetById,
  selectDatasetsPagination,
  selectOrderedDatasets,
  selectIsDatasetCreating,
  selectIsDatasetOpened,
  selectDatasetGroups,
  selectAreDatasetGroupsLoading,
} from './datasets.selectors.ts';
import type { AppState } from 'store/configureAppStore.ts';

const datasetsById = { 1: { id: 1, name: 'one' }, 2: { id: 2, name: 'two' } };

const buildState = (overrides: Record<string, unknown> = {}): AppState =>
  ({
    entities: {
      datasets: {
        datasetsById,
        datasetsOrder: [2, 1],
        areDatasetsLoading: false,
        pagination: { page: 1, pageSize: 10 },
        isDatasetCreating: false,
        isDatasetEditOpened: true,
        datasetGroups: [{ id: 5 }],
        areDatasetGroupsLoading: true,
        ...overrides,
      },
    },
  }) as unknown as AppState;

describe('datasets selectors', () => {
  it('exposes the raw slice fields', () => {
    const state = buildState();
    expect(selectDatasets(state)).toBe(datasetsById);
    expect(selectAreDatasetsLoading(state)).toBe(false);
    expect(selectDatasetsPagination(state)).toEqual({ page: 1, pageSize: 10 });
    expect(selectIsDatasetCreating(state)).toBe(false);
    expect(selectIsDatasetOpened(state)).toBe(true);
    expect(selectDatasetGroups(state)).toEqual([{ id: 5 }]);
    expect(selectAreDatasetGroupsLoading(state)).toBe(true);
  });

  it('selectDatasetById returns the matching dataset or undefined', () => {
    const state = buildState();
    expect(selectDatasetById(1)(state)).toEqual({ id: 1, name: 'one' });
    expect(selectDatasetById(99)(state)).toBeUndefined();
  });

  it('selectOrderedDatasets maps the order to datasets', () => {
    expect(selectOrderedDatasets(buildState())).toEqual([
      { id: 2, name: 'two' },
      { id: 1, name: 'one' },
    ]);
  });
});
