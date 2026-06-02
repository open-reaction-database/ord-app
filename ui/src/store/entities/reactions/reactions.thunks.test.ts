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
import { configureStore, type UnknownAction } from '@reduxjs/toolkit';
import { rootReducer } from 'store/rootReducer.ts';
import axiosInstance from 'store/axiosInstance.ts';
import { navigate } from 'wouter/use-browser-location';
import { createEmptyReaction, getReactionsList, getReactionsPage, removeReaction } from './reactions.thunks.ts';
import {
  createEmptyReactionActions,
  getReactionPageActions,
  getReactionsListActions,
  removeReactionActions,
} from './reactions.actions.ts';

vi.mock('store/axiosInstance.ts', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('wouter/use-browser-location', () => ({ navigate: vi.fn() }));
vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));
// Reaction responses carry base64-encoded protobufs; stub the parse so tests need no real binpb,
// and keep the rest of the module (merge helpers used by the reducer) intact.
vi.mock('./reactions.utils.ts', async importActual => ({
  ...((await importActual()) as Record<string, unknown>),
  parseReaction: () => ({ id: 99, pb_reaction_id: 'pb-99', data: {}, previews: {}, validation: null }),
  parseReactionList: (pages: unknown) => pages,
}));
vi.mock('./reactions.converters.ts', async importActual => ({
  ...((await importActual()) as Record<string, unknown>),
  linkReactionEntities: (data: unknown) => data,
}));

// axios methods are overloaded, so vi.mocked() doesn't surface the mock helpers under tsc;
// cast to a plain record of mock fns instead.
const axiosMock = axiosInstance as unknown as Record<'get' | 'post' | 'patch' | 'delete', ReturnType<typeof vi.fn>>;
const emptyPage = { items: [], page: 1, size: 10, total: 0, pages: 0 };

function makeStore() {
  const actions: Array<UnknownAction> = [];
  const recorder = () => (next: (action: unknown) => unknown) => (action: unknown) => {
    actions.push(action as UnknownAction);
    return next(action);
  };
  const store = configureStore({ reducer: rootReducer, middleware: getDefault => getDefault().concat(recorder) });
  return { store, types: () => actions.map(action => action.type) };
}

beforeEach(() => {
  vi.clearAllMocks();
  axiosMock.get.mockResolvedValue({ data: emptyPage });
  axiosMock.post.mockResolvedValue({ data: {} });
  axiosMock.delete.mockResolvedValue({ data: {} });
});

describe('getReactionsList', () => {
  it('fetches the dataset reactions and dispatches success', async () => {
    const { store, types } = makeStore();
    await store.dispatch(getReactionsList(5) as unknown as UnknownAction);
    expect(axiosMock.get).toHaveBeenCalledWith(
      '/datasets/5/reactions',
      expect.objectContaining({ params: expect.any(Object) }),
    );
    expect(types()).toContain(getReactionsListActions.success.type);
  });

  it('dispatches failure when the request rejects', async () => {
    axiosMock.get.mockRejectedValueOnce(new Error('boom'));
    const { store, types } = makeStore();
    await store.dispatch(getReactionsList(5) as unknown as UnknownAction);
    expect(types()).toContain(getReactionsListActions.failure.type);
  });
});

describe('getReactionsPage', () => {
  it('fetches the active dataset using the current pagination', async () => {
    const { store, types } = makeStore();
    // Seed the active dataset id (set by a prior list request) so the page URL is scoped.
    store.dispatch(getReactionsListActions.request(5));
    await store.dispatch(getReactionsPage({ page: 2 }) as unknown as UnknownAction);
    expect(axiosMock.get).toHaveBeenCalledWith(
      '/datasets/5/reactions',
      expect.objectContaining({ params: expect.any(Object) }),
    );
    expect(types()).toContain(getReactionPageActions.success.type);
  });
});

describe('removeReaction', () => {
  it('deletes the reaction, dispatches success, and navigates back to the dataset', async () => {
    const { store, types } = makeStore();
    store.dispatch(getReactionsListActions.request(5));
    await store.dispatch(removeReaction(42) as unknown as UnknownAction);
    expect(axiosMock.delete).toHaveBeenCalledWith('/datasets/5/reactions/42');
    expect(types()).toContain(removeReactionActions.success.type);
    expect(navigate).toHaveBeenCalledWith('/datasets/5');
    // Characterization: removal updates the store optimistically (reducer prunes order + total) and
    // does NOT trigger a list refetch — no getReactionPage/List request follows the success.
    expect(types()).not.toContain(getReactionPageActions.request.type);
  });
});

describe('createEmptyReaction', () => {
  it('creates a reaction and navigates to it without refetching the list', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: { binpb: '', molblocks: {}, validation: null } });
    const { store, types } = makeStore();
    store.dispatch(getReactionsListActions.request(5));
    await store.dispatch(createEmptyReaction() as unknown as UnknownAction);
    expect(axiosMock.post).toHaveBeenCalledWith('/datasets/5/reactions/from-scratch');
    expect(types()).toContain(createEmptyReactionActions.success.type);
    expect(navigate).toHaveBeenCalledWith('/datasets/5/reactions/99');
    expect(types()).not.toContain(getReactionPageActions.request.type);
  });
});
