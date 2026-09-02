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
import { selectCanDatasetBeEdited } from './canDatasetBeEdited.selectors.ts';
import { USER_ROLES } from 'common/types';
import type { Dataset } from 'store/entities/datasets/datasets.types.ts';
import type { GroupItem } from 'store/entities/groups/groups.types.ts';
import type { AppState } from 'store/configureAppStore.ts';

const datasetWithGroups = (groupIds: Array<number>): Dataset =>
  ({ groups: groupIds.map(id => ({ id })) }) as Dataset;

const group = (id: number, role: USER_ROLES): GroupItem => ({
  id,
  name: `g${id}`,
  role,
});

const buildState = (
  activeDatasetId: number,
  datasetsById: Record<number, Dataset>,
  groupsById: Record<number, GroupItem>,
): AppState =>
  ({
    entities: {
      reactions: { activeDatasetId },
      datasets: { datasetsById },
      groups: { groupsById },
    },
  }) as unknown as AppState;

describe('selectCanDatasetBeEdited', () => {
  it('is false when the active dataset is not loaded', () => {
    expect(selectCanDatasetBeEdited(buildState(1, {}, {}))).toBe(false);
  });

  it('is true when the user is an editor in any of the dataset groups', () => {
    const state = buildState(
      1,
      { 1: datasetWithGroups([10, 20]) },
      { 10: group(10, USER_ROLES.VIEWER), 20: group(20, USER_ROLES.EDITOR) },
    );
    expect(selectCanDatasetBeEdited(state)).toBe(true);
  });

  it('is true when the user is an admin in any of the dataset groups', () => {
    const state = buildState(
      1,
      { 1: datasetWithGroups([10]) },
      { 10: group(10, USER_ROLES.ADMIN) },
    );
    expect(selectCanDatasetBeEdited(state)).toBe(true);
  });

  it('is false when the user is only a viewer across the dataset groups', () => {
    const state = buildState(
      1,
      { 1: datasetWithGroups([10]) },
      { 10: group(10, USER_ROLES.VIEWER) },
    );
    expect(selectCanDatasetBeEdited(state)).toBe(false);
  });

  it('is false when a dataset group is missing from the groups store (undefined role)', () => {
    const state = buildState(1, { 1: datasetWithGroups([99]) }, {});
    expect(selectCanDatasetBeEdited(state)).toBe(false);
  });
});
