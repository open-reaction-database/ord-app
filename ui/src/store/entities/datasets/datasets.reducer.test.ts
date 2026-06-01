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
import { datasetsReducer } from './datasets.reducer.ts';
import {
  clearDatasetGroupsListAction,
  createDatasetFromFileActions,
  createNewDatasetActions,
  getDatasetActions,
  getDatasetGroupsActions,
  getDatasetPageActions,
  getGroupsInitialDatasetListActions,
  setDatasetEditOpenedAction,
  shareDatasetWithGroupActions,
  unshareDatasetWithGroupActions,
  updateDatasetActions,
} from './datasets.actions.ts';
import { setActiveGroupIdAction } from '../groups/groups.actions.ts';
import { emptyPagination } from 'common/constants.ts';
import type { Dataset, DatasetGroup } from './datasets.types.ts';
import type { Pages } from 'common/types';

const makeDataset = (id: number, overrides: Partial<Dataset> = {}): Dataset => ({
  id,
  name: `dataset-${id}`,
  description: `description-${id}`,
  owner: { id: 1, email: 'owner@example.com', name: 'Owner' },
  created_at: '2026-01-01T00:00:00Z',
  modified_at: '2026-01-01T00:00:00Z',
  groups: [],
  reactions_count: { total: 0, invalid: 0, valid: 0, none: 0 },
  ...overrides,
});

const makePage = (items: Array<Dataset>, overrides: Partial<Pages<Dataset>> = {}): Pages<Dataset> => ({
  items,
  page: 1,
  size: 10,
  total: items.length,
  pages: 1,
  ...overrides,
});

const initialState = () => datasetsReducer(undefined, { type: '@@INIT' });

describe('datasetsReducer', () => {
  it('returns the initial state', () => {
    expect(initialState()).toEqual({
      datasetsById: {},
      datasetsOrder: [],
      pagination: emptyPagination,
      areDatasetsLoading: false,
      isDatasetCreating: false,
      isDatasetEditOpened: false,
      datasetGroups: null,
      areDatasetGroupsLoading: false,
    });
  });

  describe('datasetsById', () => {
    it('stores a single fetched dataset by id', () => {
      const dataset = makeDataset(1);
      const state = datasetsReducer(initialState(), getDatasetActions.success(dataset));
      expect(state.datasetsById).toEqual({ 1: dataset });
    });

    it('merges updated fields into an existing dataset on update success', () => {
      const dataset = makeDataset(1, { name: 'old', description: 'old desc' });
      let state = datasetsReducer(initialState(), getDatasetActions.success(dataset));
      state = datasetsReducer(
        state,
        updateDatasetActions.success({ ...dataset, name: 'new', description: 'new desc' }),
      );
      expect(state.datasetsById[1].name).toBe('new');
      expect(state.datasetsById[1].description).toBe('new desc');
      // unrelated fields are preserved by the merge
      expect(state.datasetsById[1].owner).toEqual(dataset.owner);
    });

    it('adds newly created datasets (empty and from-file)', () => {
      const created = makeDataset(2);
      const fromFile = makeDataset(3);
      let state = datasetsReducer(initialState(), createNewDatasetActions.success(created));
      state = datasetsReducer(state, createDatasetFromFileActions.success(fromFile));
      expect(Object.keys(state.datasetsById)).toEqual(['2', '3']);
    });

    it('merges list payloads over existing entries without dropping prior datasets', () => {
      const existing = makeDataset(1, { name: 'existing' });
      let state = datasetsReducer(initialState(), getDatasetActions.success(existing));
      // a list page that re-includes id 1 (partial) plus a new id 2
      const page = makePage([makeDataset(1, { name: 'refreshed' }), makeDataset(2)]);
      state = datasetsReducer(state, getDatasetPageActions.success(page));
      expect(state.datasetsById[1].name).toBe('refreshed');
      expect(state.datasetsById[2]).toBeDefined();
    });
  });

  describe('datasetsOrder', () => {
    it('records the order of ids from a successful list', () => {
      const page = makePage([makeDataset(5), makeDataset(2), makeDataset(9)]);
      const state = datasetsReducer(initialState(), getGroupsInitialDatasetListActions.success(page));
      expect(state.datasetsOrder).toEqual([5, 2, 9]);
    });

    it('resets the order when the active group changes', () => {
      const page = makePage([makeDataset(5)]);
      let state = datasetsReducer(initialState(), getDatasetPageActions.success(page));
      expect(state.datasetsOrder).toEqual([5]);
      state = datasetsReducer(state, setActiveGroupIdAction(7));
      expect(state.datasetsOrder).toEqual([]);
    });

    it('clears the order while a page request is in flight', () => {
      const page = makePage([makeDataset(5)]);
      let state = datasetsReducer(initialState(), getDatasetPageActions.success(page));
      state = datasetsReducer(state, getDatasetPageActions.request({ page: 2, size: 10 }));
      expect(state.datasetsOrder).toEqual([]);
    });
  });

  describe('areDatasetsLoading', () => {
    it('is true while listing and on active-group change, false once settled', () => {
      let state = datasetsReducer(initialState(), setActiveGroupIdAction(1));
      expect(state.areDatasetsLoading).toBe(true);
      state = datasetsReducer(state, getDatasetPageActions.success(makePage([])));
      expect(state.areDatasetsLoading).toBe(false);
      state = datasetsReducer(state, getGroupsInitialDatasetListActions.request(1));
      expect(state.areDatasetsLoading).toBe(true);
      state = datasetsReducer(state, getGroupsInitialDatasetListActions.failure(new Error('x')));
      expect(state.areDatasetsLoading).toBe(false);
    });
  });

  describe('isDatasetCreating', () => {
    it('toggles around create requests', () => {
      let state = datasetsReducer(
        initialState(),
        createNewDatasetActions.request({ name: 'a', description: 'b', groupId: 1 }),
      );
      expect(state.isDatasetCreating).toBe(true);
      state = datasetsReducer(state, createNewDatasetActions.success(makeDataset(1)));
      expect(state.isDatasetCreating).toBe(false);
    });
  });

  describe('pagination', () => {
    it('updates page params on request and totals on success', () => {
      let state = datasetsReducer(initialState(), getDatasetPageActions.request({ page: 3, size: 25 }));
      expect(state.pagination).toMatchObject({ page: 3, size: 25 });
      state = datasetsReducer(state, getDatasetPageActions.success(makePage([], { total: 42, pages: 5 })));
      expect(state.pagination).toMatchObject({ page: 3, size: 25, total: 42, pages: 5 });
    });

    it('resets to empty pagination on active-group change', () => {
      let state = datasetsReducer(initialState(), getDatasetPageActions.request({ page: 3, size: 25 }));
      state = datasetsReducer(state, setActiveGroupIdAction(1));
      expect(state.pagination).toEqual(emptyPagination);
    });
  });

  describe('isDatasetEditOpened', () => {
    it('reflects the set action and closes on update success', () => {
      let state = datasetsReducer(initialState(), setDatasetEditOpenedAction(true));
      expect(state.isDatasetEditOpened).toBe(true);
      state = datasetsReducer(state, updateDatasetActions.success(makeDataset(1)));
      expect(state.isDatasetEditOpened).toBe(false);
    });
  });

  describe('datasetGroups', () => {
    const groups: Array<DatasetGroup> = [
      { id: 1, name: 'g1', is_primary: true },
      { id: 2, name: 'g2', is_primary: false },
    ];

    it('stores fetched groups and clears them on the clear action', () => {
      let state = datasetsReducer(initialState(), getDatasetGroupsActions.success(groups));
      expect(state.datasetGroups).toEqual(groups);
      state = datasetsReducer(state, clearDatasetGroupsListAction());
      expect(state.datasetGroups).toBeNull();
    });

    it('removes the unshared group from the list', () => {
      let state = datasetsReducer(initialState(), getDatasetGroupsActions.success(groups));
      state = datasetsReducer(state, unshareDatasetWithGroupActions.success(1));
      expect(state.datasetGroups).toEqual([{ id: 2, name: 'g2', is_primary: false }]);
    });

    it('stays null when unshare success arrives without a loaded list', () => {
      const state = datasetsReducer(initialState(), unshareDatasetWithGroupActions.success(1));
      expect(state.datasetGroups).toBeNull();
    });
  });

  describe('areDatasetGroupsLoading', () => {
    const sharePayload = { datasetId: 1, groupId: 2, primaryGroupId: 3 };

    it('is true while share/unshare/get requests are pending', () => {
      const state = datasetsReducer(initialState(), shareDatasetWithGroupActions.request(sharePayload));
      expect(state.areDatasetGroupsLoading).toBe(true);
    });

    it('is false once the groups list resolves', () => {
      let state = datasetsReducer(initialState(), getDatasetGroupsActions.request(1));
      expect(state.areDatasetGroupsLoading).toBe(true);
      state = datasetsReducer(state, getDatasetGroupsActions.success([]));
      expect(state.areDatasetGroupsLoading).toBe(false);
    });

    it('is false once the groups list is cleared', () => {
      let state = datasetsReducer(initialState(), getDatasetGroupsActions.request(1));
      expect(state.areDatasetGroupsLoading).toBe(true);
      state = datasetsReducer(state, clearDatasetGroupsListAction());
      expect(state.areDatasetGroupsLoading).toBe(false);
    });

    // shareDatasetWithGroupActions.success is intentionally NOT a reset trigger: the
    // shareDatasetWithGroup thunk dispatches success() and then re-fetches via
    // getDatasetGroups, so the loading flag is cleared by that follow-up
    // getDatasetGroupsActions.request -> .success cycle, keeping the spinner up across
    // the refetch. This test pins that cascaded-request design.
    it('stays true after share success alone (reset by the follow-up refetch)', () => {
      let state = datasetsReducer(initialState(), shareDatasetWithGroupActions.request(sharePayload));
      expect(state.areDatasetGroupsLoading).toBe(true);
      state = datasetsReducer(state, shareDatasetWithGroupActions.success());
      expect(state.areDatasetGroupsLoading).toBe(true);
      // the thunk's follow-up getDatasetGroups request/success is what clears it
      state = datasetsReducer(state, getDatasetGroupsActions.request(sharePayload.datasetId));
      state = datasetsReducer(state, getDatasetGroupsActions.success([]));
      expect(state.areDatasetGroupsLoading).toBe(false);
    });
  });
});
