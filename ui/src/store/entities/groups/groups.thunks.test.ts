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
import {
  addGroupMember,
  createGroup,
  emptyGroupTrash,
  getGroupList,
  getGroupTrash,
  removeGroupMembers,
  restoreGroupTrashItem,
  updateGroupMembers,
} from './groups.thunks.ts';
import {
  addGroupMemberActions,
  createGroupActions,
  emptyGroupTrashActions,
  getGroupListActions,
  getGroupTrashActions,
  removeGroupMembersActions,
  restoreGroupTrashItemActions,
  updateGroupMembersActions,
} from './groups.actions.ts';
import { setEditingGroupIdAction } from 'store/features/groups/groups.actions.ts';
import { ADD_MEMBER_ERROR } from './groups.types.ts';
import { USER_ROLES } from 'common/types';
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';

vi.mock('store/axiosInstance.ts', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));

// axios methods are overloaded, so vi.mocked() doesn't surface the mock helpers under tsc;
// cast to a plain record of mock fns instead.
const axiosMock = axiosInstance as unknown as Record<
  'get' | 'post' | 'patch' | 'delete',
  ReturnType<typeof vi.fn>
>;

function makeStore() {
  const actions: Array<UnknownAction> = [];
  const recorder = () => (next: (action: unknown) => unknown) => (action: unknown) => {
    actions.push(action as UnknownAction);
    return next(action);
  };
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefault => getDefault().concat(recorder),
  });
  return { store, actions, types: () => actions.map(action => action.type) };
}

/** Rejects the way axios does so the thunk's `isAxiosError` status branches are exercised. */
const axiosError = (status: number) => ({ isAxiosError: true, response: { status } });

beforeEach(() => {
  vi.clearAllMocks();
  axiosMock.get.mockResolvedValue({ data: [] });
  axiosMock.post.mockResolvedValue({ data: { user: { name: 'Ann' } } });
  axiosMock.patch.mockResolvedValue({ data: { user: { name: 'Ann' } } });
});

describe('getGroupList', () => {
  it('fetches the group list and dispatches success', async () => {
    const { store, types } = makeStore();
    await store.dispatch(getGroupList() as unknown as UnknownAction);
    expect(axiosMock.get).toHaveBeenCalledWith('/groups');
    expect(types()).toContain(getGroupListActions.success.type);
  });
});

describe('createGroup', () => {
  it('creates the group then refetches the list', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: { id: 5 } });
    const { store, types } = makeStore();
    await store.dispatch(createGroup('My group') as unknown as UnknownAction);
    expect(axiosMock.post).toHaveBeenCalledWith('/groups', { name: 'My group' });
    expect(types()).toEqual(
      expect.arrayContaining([
        getGroupListActions.request.type,
        createGroupActions.success.type,
      ]),
    );
  });
});

describe('group trash', () => {
  it('loads, restores, and empties trash through group-scoped endpoints', async () => {
    const trash = { datasets: [], reactions: [] };
    axiosMock.get.mockResolvedValueOnce({ data: trash });
    axiosMock.get.mockResolvedValue({
      data: { items: [], page: 1, size: 10, total: 0, pages: 0 },
    });
    const { store, types } = makeStore();

    await store.dispatch(getGroupTrash(3) as unknown as UnknownAction);
    await store.dispatch(
      restoreGroupTrashItem({
        groupId: 3,
        kind: 'reaction',
        id: 8,
      }) as unknown as UnknownAction,
    );
    await store.dispatch(emptyGroupTrash(3) as unknown as UnknownAction);

    expect(axiosMock.get).toHaveBeenCalledWith('/groups/3/trash');
    expect(axiosMock.post).toHaveBeenCalledWith('/groups/3/trash/restore', {
      kind: 'reaction',
      id: 8,
    });
    expect(axiosMock.get).toHaveBeenCalledWith('/datasets', {
      params: { page: 1, size: 10 },
    });
    expect(axiosMock.post).toHaveBeenCalledWith('/groups/3/trash/empty');
    expect(types()).toEqual(
      expect.arrayContaining([
        getGroupTrashActions.success.type,
        restoreGroupTrashItemActions.success.type,
        emptyGroupTrashActions.success.type,
      ]),
    );
  });

  it('surfaces FastAPI detail when restore conflicts', async () => {
    axiosMock.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 409,
        data: { detail: 'Reaction id already in use in this dataset.' },
      },
    });
    const { store, types } = makeStore();

    await store.dispatch(
      restoreGroupTrashItem({
        groupId: 3,
        kind: 'reaction',
        id: 8,
      }) as unknown as UnknownAction,
    );

    expect(types()).toContain(restoreGroupTrashItemActions.failure.type);
    expect(showNotification).toHaveBeenCalledWith({
      variant: NotificationVariant.ERROR,
      message: 'Reaction id already in use in this dataset.',
    });
  });
});

describe('updateGroupMembers', () => {
  it('patches the member, refetches the list, and dispatches success', async () => {
    const { store, types } = makeStore();
    store.dispatch(setEditingGroupIdAction(3));
    await store.dispatch(
      updateGroupMembers({
        user_id: 8,
        role: USER_ROLES.EDITOR,
      }) as unknown as UnknownAction,
    );
    expect(axiosMock.patch).toHaveBeenCalledWith('/groups/3/members', {
      user_id: 8,
      role: USER_ROLES.EDITOR,
    });
    expect(types()).toEqual(
      expect.arrayContaining([
        getGroupListActions.request.type,
        updateGroupMembersActions.success.type,
      ]),
    );
  });
});

describe('removeGroupMembers', () => {
  it('posts the removal scoped to the editing group and dispatches success', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: {} });
    const { store, types } = makeStore();
    store.dispatch(setEditingGroupIdAction(3));
    await store.dispatch(removeGroupMembers([8]) as unknown as UnknownAction);
    expect(axiosMock.post).toHaveBeenCalledWith('/groups/3/members/remove', [8]);
    expect(types()).toContain(removeGroupMembersActions.success.type);
  });
});

describe('addGroupMember', () => {
  it('adds the member and dispatches success on the happy path', async () => {
    const { store, actions } = makeStore();
    store.dispatch(setEditingGroupIdAction(3));
    await store.dispatch(addGroupMember('ann@example.com') as unknown as UnknownAction);
    expect(axiosMock.post).toHaveBeenCalledWith('/groups/3/members', {
      identity: 'ann@example.com',
      role: USER_ROLES.VIEWER,
    });
    expect(
      actions.some(action => action.type === addGroupMemberActions.success.type),
    ).toBe(true);
  });

  it.each([
    [409, ADD_MEMBER_ERROR.ALREADY_MEMBER],
    [404, ADD_MEMBER_ERROR.NOT_FOUND],
    [500, ADD_MEMBER_ERROR.GENERIC],
  ])('maps HTTP %i to the %s failure', async (status, expected) => {
    axiosMock.post.mockRejectedValueOnce(axiosError(status));
    const { store, actions } = makeStore();
    store.dispatch(setEditingGroupIdAction(3));
    await store.dispatch(addGroupMember('ann@example.com') as unknown as UnknownAction);
    const failure = actions.find(
      action => action.type === addGroupMemberActions.failure.type,
    ) as unknown as { payload: string } | undefined;
    expect(failure?.payload).toBe(expected);
  });
});
