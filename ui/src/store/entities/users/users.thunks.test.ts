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
import { createUser } from './users.thunks.ts';
import { createUserActions } from './users.actions.ts';

vi.mock('store/axiosInstance.ts', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
// createThunk imports showNotification transitively; mock it so this file stays insulated from the
// toast infrastructure even if a future transitive dependency needs React context.
vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));

const axiosMock = axiosInstance as unknown as Record<'post', ReturnType<typeof vi.fn>>;
const tokens = { access_token: 'a-token', id_token: 'i-token' };
const user = { id: 7, orcid_id: '0000', name: 'E2E User', email: 'e2e@example.com' };

beforeEach(() => {
  vi.clearAllMocks();
  axiosMock.post.mockResolvedValue({ data: user });
});

describe('createUser', () => {
  it('JIT-provisions the user from the auth tokens and dispatches success with the user', async () => {
    const { store, actions, types } = makeRecordingStore();
    await store.dispatch(createUser(tokens) as unknown as UnknownAction);

    expect(axiosMock.post).toHaveBeenCalledWith('/auth/jit-provisioning', tokens);
    expect(types()).toContain(createUserActions.success.type);
    const success = actions().find(a => a.type === createUserActions.success.type) as { payload?: typeof user };
    expect(success?.payload).toEqual(user);
  });

  it('dispatches failure when provisioning rejects', async () => {
    axiosMock.post.mockRejectedValueOnce(new Error('401'));
    const { store, types } = makeRecordingStore();
    await store.dispatch(createUser(tokens) as unknown as UnknownAction);
    expect(types()).toContain(createUserActions.failure.type);
    expect(types()).not.toContain(createUserActions.success.type);
  });
});
