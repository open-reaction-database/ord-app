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
import { addIdentifierByName } from './reactionInputs.thunks.ts';
import { addIdentifierByNameActions } from './reactionInputs.actions.ts';

vi.mock('store/axiosInstance.ts', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));
// addUpdateReactionField is exercised in reactions.thunks.test.ts; here we only care that this thunk
// hands it the resolved identifier at the next free index, so replace it with a plain recorded action.
const addUpdateReactionField = vi.fn((arg: unknown) => ({
  type: 'reactions/addUpdateReactionField/mock',
  payload: arg,
}));
vi.mock('store/entities/reactions/reactions.thunks.ts', async importActual => ({
  ...((await importActual()) as Record<string, unknown>),
  addUpdateReactionField: (arg: unknown) => addUpdateReactionField(arg),
}));

const axiosMock = axiosInstance as unknown as Record<
  'get' | 'post' | 'patch' | 'delete',
  ReturnType<typeof vi.fn>
>;
const makeStore = makeRecordingStore;
const pathComponents = ['inputs', 0, 'components', 0, 'identifiers'];

beforeEach(() => {
  vi.clearAllMocks();
  axiosMock.post.mockResolvedValue({ data: { smiles: 'O' } });
});

describe('addIdentifierByName', () => {
  it('resolves the name to a SMILES identifier and appends it at the next index', async () => {
    const { store, types } = makeStore();
    await store.dispatch(
      addIdentifierByName({
        reactionId: 99,
        pathComponents,
        name: 'water',
      }) as unknown as UnknownAction,
    );

    expect(axiosMock.post).toHaveBeenCalledWith('/resolve-compound', {
      identifier_type: 'name',
      identifier: 'water',
    });
    expect(types()).toContain(addIdentifierByNameActions.success.type);

    // No identifiers in the (empty) store, so the new one lands at index 0, and the resolved SMILES
    // is carried through with the looked-up name kept as the identifier details.
    expect(addUpdateReactionField).toHaveBeenCalledTimes(1);
    const arg = addUpdateReactionField.mock.calls[0][0] as {
      reactionId: number;
      pathComponents: Array<string | number>;
      newValue: { value: string; details: string };
    };
    expect(arg.reactionId).toBe(99);
    expect(arg.pathComponents).toEqual([...pathComponents, 0]);
    expect(arg.newValue.value).toBe('O');
    expect(arg.newValue.details).toBe('water');
  });

  it('dispatches failure and does not update the reaction when resolution rejects', async () => {
    axiosMock.post.mockRejectedValueOnce(new Error('not found'));
    const { store, types } = makeStore();
    await store.dispatch(
      addIdentifierByName({
        reactionId: 99,
        pathComponents,
        name: 'bogus',
      }) as unknown as UnknownAction,
    );

    expect(types()).toContain(addIdentifierByNameActions.failure.type);
    expect(types()).not.toContain(addIdentifierByNameActions.success.type);
    expect(addUpdateReactionField).not.toHaveBeenCalled();
  });
});
