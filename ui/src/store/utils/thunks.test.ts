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
import type { AppThunk, AppVoidThunk } from 'common/types/store/thunk.ts';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type UnknownAction } from '@reduxjs/toolkit';
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';
import { makeRecordingStore } from 'test/recordingStore.ts';
import { createAsyncAction } from './actions.ts';
import { createThunk, createThunkWithExplicitResult } from './thunks.ts';

// createThunk shows an error toast on axios failures; mock it so this file stays insulated from the
// toast infrastructure and we can assert when (and only when) it fires.
vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));

const notifyMock = vi.mocked(showNotification);

// A representative async action: number request payload, object success payload.
const testActions = createAsyncAction<number, { value: string }>('test/thunk');

/** An axios-shaped error carrying a string `detail` (the only branch that surfaces a toast). */
function axiosErrorWithDetail(detail: unknown): unknown {
  return { isAxiosError: true, response: { data: { detail } } };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createThunk', () => {
  it('dispatches request, runs the inner thunk, dispatches and returns its result action', async () => {
    const inner: AppThunk<typeof testActions> = arg => async () => testActions.success({ value: `got-${arg}` });
    const { store, types, actions } = makeRecordingStore();

    const result = (await store.dispatch(createThunk(testActions, inner)(5) as unknown as UnknownAction)) as ReturnType<
      typeof testActions.success
    >;

    expect(types()).toEqual([testActions.request.type, testActions.success.type]);
    const request = actions().find(a => a.type === testActions.request.type) as { payload?: number };
    expect(request?.payload).toBe(5);
    expect(result).toEqual(testActions.success({ value: 'got-5' }));
    expect(notifyMock).not.toHaveBeenCalled();
  });

  it('on an axios error with a string detail: toasts, dispatches failure with the detail, returns undefined', async () => {
    const inner: AppThunk<typeof testActions> = () => async () => {
      throw axiosErrorWithDetail('boom');
    };
    const { store, types, actions } = makeRecordingStore();

    const result = await store.dispatch(createThunk(testActions, inner)(1) as unknown as UnknownAction);

    expect(types()).toEqual([testActions.request.type, testActions.failure.type]);
    expect(types()).not.toContain(testActions.success.type);
    const failure = actions().find(a => a.type === testActions.failure.type) as { payload?: unknown };
    expect(failure?.payload).toBe('boom');
    expect(notifyMock).toHaveBeenCalledWith({ variant: NotificationVariant.ERROR, message: 'boom' });
    expect(result).toBeUndefined();
  });

  it('on an axios error without a string detail: dispatches failure with null, no toast', async () => {
    const inner: AppThunk<typeof testActions> = () => async () => {
      throw axiosErrorWithDetail({ nested: 'object' });
    };
    const { store, actions } = makeRecordingStore();

    await store.dispatch(createThunk(testActions, inner)(1) as unknown as UnknownAction);

    const failure = actions().find(a => a.type === testActions.failure.type) as { payload?: unknown };
    expect(failure?.payload).toBeNull();
    expect(notifyMock).not.toHaveBeenCalled();
  });

  it('on a non-axios error: dispatches failure with null, no toast', async () => {
    const inner: AppThunk<typeof testActions> = () => async () => {
      throw new Error('plain');
    };
    const { store, types, actions } = makeRecordingStore();

    await store.dispatch(createThunk(testActions, inner)(1) as unknown as UnknownAction);

    expect(types()).toContain(testActions.failure.type);
    const failure = actions().find(a => a.type === testActions.failure.type) as { payload?: unknown };
    expect(failure?.payload).toBeNull();
    expect(notifyMock).not.toHaveBeenCalled();
  });
});

describe('createThunkWithExplicitResult', () => {
  it('dispatches request and lets the inner thunk own its success dispatch (no extra result dispatch)', async () => {
    const inner: AppVoidThunk<typeof testActions> = arg => async dispatch => {
      dispatch(testActions.success({ value: `explicit-${arg}` }));
    };
    const { store, types, actions } = makeRecordingStore();

    await store.dispatch(createThunkWithExplicitResult(testActions, inner)(9) as unknown as UnknownAction);

    // request then the inner thunk's own success — exactly one success action, not a re-dispatched result.
    expect(types()).toEqual([testActions.request.type, testActions.success.type]);
    const success = actions().find(a => a.type === testActions.success.type) as { payload?: { value: string } };
    expect(success?.payload).toEqual({ value: 'explicit-9' });
  });

  it('routes errors through the shared handler: toasts and dispatches failure with the detail', async () => {
    const inner: AppVoidThunk<typeof testActions> = () => async () => {
      throw axiosErrorWithDetail('explicit-boom');
    };
    const { store, types, actions } = makeRecordingStore();

    await store.dispatch(createThunkWithExplicitResult(testActions, inner)(0) as unknown as UnknownAction);

    expect(types()).toEqual([testActions.request.type, testActions.failure.type]);
    const failure = actions().find(a => a.type === testActions.failure.type) as { payload?: unknown };
    expect(failure?.payload).toBe('explicit-boom');
    expect(notifyMock).toHaveBeenCalledWith({ variant: NotificationVariant.ERROR, message: 'explicit-boom' });
  });

  it('on an axios error without a string detail: dispatches failure with null, no toast', async () => {
    const inner: AppVoidThunk<typeof testActions> = () => async () => {
      throw axiosErrorWithDetail({ nested: 'object' });
    };
    const { store, actions } = makeRecordingStore();

    await store.dispatch(createThunkWithExplicitResult(testActions, inner)(0) as unknown as UnknownAction);

    const failure = actions().find(a => a.type === testActions.failure.type) as { payload?: unknown };
    expect(failure?.payload).toBeNull();
    expect(notifyMock).not.toHaveBeenCalled();
  });

  it('on a non-axios error: dispatches failure with null, no toast', async () => {
    const inner: AppVoidThunk<typeof testActions> = () => async () => {
      throw new Error('plain');
    };
    const { store, types, actions } = makeRecordingStore();

    await store.dispatch(createThunkWithExplicitResult(testActions, inner)(0) as unknown as UnknownAction);

    expect(types()).toContain(testActions.failure.type);
    const failure = actions().find(a => a.type === testActions.failure.type) as { payload?: unknown };
    expect(failure?.payload).toBeNull();
    expect(notifyMock).not.toHaveBeenCalled();
  });
});
