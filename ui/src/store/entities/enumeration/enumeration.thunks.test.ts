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
import { makeRecordingStore } from 'test/recordingStore.ts';
import { finishEnumeration } from './enumeration.thunks.ts';
import { enumerateBatchActions, finishEnumerationAction, startEnumerationActions } from './enumeration.actions.ts';
import type { StartEnumeration } from './enumeration.types.ts';
import { getGroupsInitialDatasetListActions } from '../datasets/datasets.actions.ts';

vi.mock('store/axiosInstance.ts', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));

const axiosMock = axiosInstance as unknown as Record<'get' | 'post' | 'patch' | 'delete', ReturnType<typeof vi.fn>>;
const emptyPage = { items: [], page: 1, size: 10, total: 0, pages: 0 };

// Seed an in-progress enumeration that targets a NEW dataset (dataset is an object, not an id),
// with one enumerated reaction so finishEnumeration doesn't early-return.
function seedNewDatasetProgress(store: ReturnType<typeof makeRecordingStore>['store']) {
  const startPayload: StartEnumeration = {
    dataset: { groupId: 3, name: 'Enumerated', description: 'desc' },
    matching: [],
    templateCSV: { headers: [], content: [] },
    data: {} as StartEnumeration['data'],
    variables: [],
  };
  store.dispatch(startEnumerationActions(startPayload));
  store.dispatch(enumerateBatchActions.success({ reactions: ['serialized-reaction'], errors: [] }));
}

beforeEach(() => {
  vi.clearAllMocks();
  axiosMock.get.mockResolvedValue({ data: emptyPage });
  axiosMock.post.mockResolvedValue({ data: { id: 7 } });
});

describe('finishEnumeration (new dataset)', () => {
  it('creates the dataset and refetches the datasets list so it appears without a manual reload (#611)', async () => {
    const { store, types } = makeRecordingStore();
    seedNewDatasetProgress(store);

    await store.dispatch(finishEnumeration() as unknown as UnknownAction);

    expect(axiosMock.post).toHaveBeenCalledWith('/groups/3/datasets/enumerate', expect.any(Object));
    expect(types()).toContain(finishEnumerationAction.type);
    // The new dataset is created server-side but isn't in the list store yet; refetch the list. (#611)
    expect(types()).toContain(getGroupsInitialDatasetListActions.request.type);
  });
});
