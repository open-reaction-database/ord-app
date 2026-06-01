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
import { groupsReducer } from './groups.reducer.ts';
import {
  addGroupMemberActions,
  getGroupListActions,
  getGroupMembersActions,
  removeGroupMembersActions,
  resetAddMemberErrorAction,
  setAddMemberInputValueAction,
  setEditingGroupIdAction,
  setGroupSearchAction,
  renameGroupActions,
  updateGroupMembersActions,
} from './groups.actions.ts';
import { USER_ROLES } from 'common/types';
import type { GroupItem, GroupMember } from './groups.types.ts';

const makeGroupItem = (id: number, name: string, role: USER_ROLES = USER_ROLES.ADMIN): GroupItem => ({
  id,
  name,
  role,
});

const makeMember = (userId: number, role: USER_ROLES = USER_ROLES.VIEWER): GroupMember => ({
  id: userId * 10,
  role,
  user: {
    id: userId,
    name: `user-${userId}`,
    email: `user-${userId}@example.com`,
    external_id: `ext-${userId}`,
    avatar_url: '',
  },
});

const initialState = () => groupsReducer(undefined, { type: '@@INIT' });

describe('groupsReducer', () => {
  it('returns the initial state', () => {
    expect(initialState()).toEqual({
      groupsById: {},
      groupNameSearch: '',
      editingGroupId: null,
      groupsMembersByGroupId: {},
      addMemberInputValue: '',
      addMemberError: null,
      isGroupUpdating: false,
    });
  });

  describe('groupsById', () => {
    it('indexes the fetched group list by id', () => {
      const list = [makeGroupItem(1, 'Alpha'), makeGroupItem(2, 'Beta')];
      const state = groupsReducer(initialState(), getGroupListActions.success(list));
      expect(state.groupsById).toEqual({ 1: list[0], 2: list[1] });
    });
  });

  describe('groupNameSearch / editingGroupId', () => {
    it('tracks the search string', () => {
      const state = groupsReducer(initialState(), setGroupSearchAction('foo'));
      expect(state.groupNameSearch).toBe('foo');
    });

    it('tracks the editing group id (including reset to null)', () => {
      let state = groupsReducer(initialState(), setEditingGroupIdAction(5));
      expect(state.editingGroupId).toBe(5);
      state = groupsReducer(state, setEditingGroupIdAction(null));
      expect(state.editingGroupId).toBeNull();
    });
  });

  describe('groupsMembersByGroupId', () => {
    it('stores members for a group', () => {
      const members = [makeMember(1), makeMember(2)];
      const state = groupsReducer(initialState(), getGroupMembersActions.success({ groupId: 7, members }));
      expect(state.groupsMembersByGroupId[7]).toEqual(members);
    });

    it('replaces a single member on update success', () => {
      const members = [makeMember(1, USER_ROLES.VIEWER), makeMember(2, USER_ROLES.VIEWER)];
      let state = groupsReducer(initialState(), getGroupMembersActions.success({ groupId: 7, members }));
      const promoted = makeMember(2, USER_ROLES.EDITOR);
      state = groupsReducer(state, updateGroupMembersActions.success({ groupId: 7, member: promoted }));
      expect(state.groupsMembersByGroupId[7]).toEqual([members[0], promoted]);
    });

    it('removes members by user id', () => {
      const members = [makeMember(1), makeMember(2), makeMember(3)];
      let state = groupsReducer(initialState(), getGroupMembersActions.success({ groupId: 7, members }));
      state = groupsReducer(state, removeGroupMembersActions.success({ groupId: 7, membersId: [1, 3] }));
      expect(state.groupsMembersByGroupId[7]).toEqual([members[1]]);
    });

    it('appends an added member', () => {
      const members = [makeMember(1)];
      let state = groupsReducer(initialState(), getGroupMembersActions.success({ groupId: 7, members }));
      const added = makeMember(2);
      state = groupsReducer(state, addGroupMemberActions.success({ groupId: 7, member: added }));
      expect(state.groupsMembersByGroupId[7]).toEqual([members[0], added]);
    });

    it('keeps other groups untouched when one group changes', () => {
      let state = groupsReducer(
        initialState(),
        getGroupMembersActions.success({ groupId: 1, members: [makeMember(1)] }),
      );
      state = groupsReducer(state, getGroupMembersActions.success({ groupId: 2, members: [makeMember(2)] }));
      state = groupsReducer(state, removeGroupMembersActions.success({ groupId: 1, membersId: [1] }));
      expect(state.groupsMembersByGroupId[1]).toEqual([]);
      expect(state.groupsMembersByGroupId[2]).toHaveLength(1);
    });
  });

  describe('addMemberInputValue', () => {
    it('tracks input and clears it when a member is added', () => {
      // seed members so the shared addGroupMember success handler has a list to append to
      let state = groupsReducer(initialState(), getGroupMembersActions.success({ groupId: 1, members: [] }));
      state = groupsReducer(state, setAddMemberInputValueAction('alice@example.com'));
      expect(state.addMemberInputValue).toBe('alice@example.com');
      state = groupsReducer(state, addGroupMemberActions.success({ groupId: 1, member: makeMember(1) }));
      expect(state.addMemberInputValue).toBe('');
    });
  });

  describe('addMemberError', () => {
    it('records the failure payload and clears on success or reset', () => {
      let state = groupsReducer(initialState(), getGroupMembersActions.success({ groupId: 1, members: [] }));
      state = groupsReducer(state, addGroupMemberActions.failure('ALREADY_MEMBER'));
      expect(state.addMemberError).toBe('ALREADY_MEMBER');
      state = groupsReducer(state, addGroupMemberActions.success({ groupId: 1, member: makeMember(1) }));
      expect(state.addMemberError).toBeNull();

      state = groupsReducer(state, addGroupMemberActions.failure('NOT_FOUND'));
      expect(state.addMemberError).toBe('NOT_FOUND');
      state = groupsReducer(state, resetAddMemberErrorAction());
      expect(state.addMemberError).toBeNull();
    });
  });

  describe('isGroupUpdating', () => {
    it('toggles around rename and member-mutation requests', () => {
      let state = groupsReducer(initialState(), renameGroupActions.request({ id: 1, name: 'x' }));
      expect(state.isGroupUpdating).toBe(true);
      state = groupsReducer(state, renameGroupActions.success());
      expect(state.isGroupUpdating).toBe(false);

      state = groupsReducer(state, addGroupMemberActions.request('a@b.com'));
      expect(state.isGroupUpdating).toBe(true);
      state = groupsReducer(state, addGroupMemberActions.failure('GENERIC'));
      expect(state.isGroupUpdating).toBe(false);
    });
  });
});
