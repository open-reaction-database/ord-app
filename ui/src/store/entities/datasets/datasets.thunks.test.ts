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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type UnknownAction } from '@reduxjs/toolkit';
import axiosInstance from 'store/axiosInstance.ts';
import { navigate } from 'wouter/use-browser-location';
import { makeRecordingStore } from 'test/recordingStore.ts';
import {
  createEmptyDataset,
  getDataset,
  getDatasetGroups,
  getDatasetsPage,
  removeDataset,
  shareDatasetWithGroup,
  unshareDatasetWithGroup,
} from './datasets.thunks.ts';
import {
  createNewDatasetActions,
  getDatasetActions,
  getDatasetGroupsActions,
  getDatasetPageActions,
  removeDatasetActions,
  shareDatasetWithGroupActions,
  unshareDatasetWithGroupActions,
} from './datasets.actions.ts';

vi.mock('store/axiosInstance.ts', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('wouter/use-browser-location', () => ({ navigate: vi.fn() }));

// axios methods are overloaded, so vi.mocked() doesn't surface the mock helpers under tsc;
// cast to a plain record of mock fns instead.
const axiosMock = axiosInstance as unknown as Record<'get' | 'post' | 'patch' | 'delete', ReturnType<typeof vi.fn>>;

const makeStore = makeRecordingStore;

const dataset = { id: 1, name: 'd1', description: '', groups: [] };

beforeEach(() => {
  vi.clearAllMocks();
  axiosMock.get.mockResolvedValue({ data: dataset });
  axiosMock.post.mockResolvedValue({ data: dataset });
  axiosMock.patch.mockResolvedValue({ data: dataset });
  axiosMock.delete.mockResolvedValue({ data: {} });
});

describe('getDataset', () => {
  it('fetches the dataset and dispatches success', async () => {
    const { store, types } = makeStore();
    await store.dispatch(getDataset(1) as unknown as UnknownAction);
    expect(axiosMock.get).toHaveBeenCalledWith('/datasets/1');
    expect(types()).toContain(getDatasetActions.success.type);
  });

  it('dispatches failure when the request rejects', async () => {
    axiosMock.get.mockRejectedValueOnce(new Error('boom'));
    const { store, types } = makeStore();
    await store.dispatch(getDataset(1) as unknown as UnknownAction);
    expect(types()).toContain(getDatasetActions.failure.type);
  });
});

describe('getDatasetsPage', () => {
  it('requests the unscoped datasets list when no active group is set', async () => {
    axiosMock.get.mockResolvedValueOnce({ data: { items: [], page: 1, size: 10, total: 0, pages: 0 } });
    const { store, types } = makeStore();
    await store.dispatch(getDatasetsPage({ page: 1, size: 10 }) as unknown as UnknownAction);
    expect(axiosMock.get).toHaveBeenCalledWith('/datasets', expect.objectContaining({ params: expect.any(Object) }));
    expect(types()).toContain(getDatasetPageActions.success.type);
  });
});

describe('createEmptyDataset', () => {
  it('creates the dataset and navigates to it', async () => {
    const { store, types } = makeStore();
    await store.dispatch(createEmptyDataset({ groupId: 7, name: 'n', description: '' }) as unknown as UnknownAction);
    expect(axiosMock.post).toHaveBeenCalledWith('/groups/7/datasets', { name: 'n', description: '' });
    expect(types()).toContain(createNewDatasetActions.success.type);
    expect(navigate).toHaveBeenCalledWith('/datasets/1');
  });
});

describe('removeDataset', () => {
  it('deletes the dataset and navigates home', async () => {
    const { store, types } = makeStore();
    await store.dispatch(removeDataset(1) as unknown as UnknownAction);
    expect(axiosMock.delete).toHaveBeenCalledWith('/datasets/1');
    expect(types()).toContain(removeDatasetActions.success.type);
    expect(navigate).toHaveBeenCalledWith('/');
  });
});

describe('getDatasetGroups', () => {
  it('fetches the groups a dataset is shared with', async () => {
    axiosMock.get.mockResolvedValueOnce({ data: [] });
    const { store, types } = makeStore();
    await store.dispatch(getDatasetGroups(1) as unknown as UnknownAction);
    expect(axiosMock.get).toHaveBeenCalledWith('/datasets/1/groups');
    expect(types()).toContain(getDatasetGroupsActions.success.type);
  });
});

describe('shareDatasetWithGroup', () => {
  it('shares then refetches the dataset and its groups', async () => {
    axiosMock.get.mockResolvedValue({ data: [] });
    const { store, types } = makeStore();
    await store.dispatch(
      shareDatasetWithGroup({ groupId: 2, datasetId: 1, primaryGroupId: 9 }) as unknown as UnknownAction,
    );
    expect(axiosMock.post).toHaveBeenCalledWith('/groups/9/datasets/1/share', { secondary_group_id: 2 });
    // The follow-up refetch is the cache-invalidation contract: success then both getters re-run.
    expect(types()).toEqual(
      expect.arrayContaining([
        shareDatasetWithGroupActions.success.type,
        getDatasetActions.request.type,
        getDatasetGroupsActions.request.type,
      ]),
    );
  });
});

describe('unshareDatasetWithGroup', () => {
  it('unshares then refetches the dataset', async () => {
    const { store, types } = makeStore();
    await store.dispatch(
      unshareDatasetWithGroup({ groupId: 2, datasetId: 1, primaryGroupId: 9 }) as unknown as UnknownAction,
    );
    expect(axiosMock.post).toHaveBeenCalledWith('/groups/9/datasets/1/unshare', { secondary_group_id: 2 });
    expect(types()).toEqual(
      expect.arrayContaining([unshareDatasetWithGroupActions.success.type, getDatasetActions.request.type]),
    );
  });
});
