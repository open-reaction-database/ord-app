/*
 * Copyright 2024 Open Reaction Database Project Authors
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
import { combineReducers, createReducer, isAnyOf } from '@reduxjs/toolkit';
import type { ItemsById } from 'common/types';
import { itemsById } from 'common/utils';
import type { GroupMember, GroupItem } from './groups.types.ts';
import {
  addGroupMemberActions,
  createGroupActions,
  getGroupActions,
  getGroupListActions,
  getGroupMembersActions,
  removeGroupMembersActions,
  resetAddMemberErrorAction,
  setAddMemberInputValueAction,
  setEditingGroupIdAction,
  setGroupSearchAction,
  updateGroupActions,
  updateGroupMembersActions,
} from './groups.actions.ts';

const getGroupId = (group: GroupItem) => group.id;

const editingGroupId = createReducer<number | null>(null, builder => {
  builder.addCase(setEditingGroupIdAction, (_, action) => action.payload);
});

const groupNameSearch = createReducer('', builder => {
  builder.addCase(setGroupSearchAction, (_, action) => action.payload);
});

const groupsById = createReducer<ItemsById<GroupItem>>({}, builder => {
  builder.addCase(getGroupListActions.success, (_, action) => itemsById(action.payload, getGroupId));
  [getGroupActions.success, createGroupActions.success, updateGroupActions.success].forEach(action =>
    builder.addCase(action, (state, action) => {
      return {
        ...state,
        [getGroupId(action.payload)]: action.payload,
      };
    }),
  );
});

const groupsMembersByGroupId = createReducer<ItemsById<Array<GroupMember>>>({}, builder => {
  builder.addCase(getGroupMembersActions.success, (state, action) => {
    const { groupId, members } = action.payload;

    return {
      ...state,
      [groupId]: members,
    };
  });
  builder.addCase(updateGroupMembersActions.success, (state, action) => {
    const { groupId, member: updatedMember } = action.payload;

    const updatedMembers = state[groupId].map(member =>
      member.user.id === updatedMember.user.id ? updatedMember : member,
    );

    return {
      ...state,
      [groupId]: updatedMembers,
    };
  });
  builder.addCase(removeGroupMembersActions.success, (state, action) => {
    const { groupId, membersId } = action.payload;

    const updatedMembers = state[groupId].filter(member => !membersId.includes(member.user.id));

    return {
      ...state,
      [groupId]: updatedMembers,
    };
  });
  builder.addCase(addGroupMemberActions.success, (state, action) => {
    const { groupId, member } = action.payload;

    const updatedMembers = [...state[groupId], member];

    return {
      ...state,
      [groupId]: updatedMembers,
    };
  });
});

const addMemberInputValue = createReducer('', builder => {
  builder.addCase(setAddMemberInputValueAction, (_, action) => action.payload);
  builder.addCase(addGroupMemberActions.success, () => '');
});

const addMemberError = createReducer<Error | null>(null, builder => {
  builder.addCase(addGroupMemberActions.failure, (_, action) => action.payload);
  builder.addCase(resetAddMemberErrorAction, () => null);
});

const isGroupUpdating = createReducer<boolean>(false, builder => {
  builder.addMatcher(
    isAnyOf(
      updateGroupActions.request,
      updateGroupMembersActions.request,
      removeGroupMembersActions.request,
      addGroupMemberActions.request,
    ),
    () => true,
  );
  builder.addMatcher(
    isAnyOf(
      updateGroupActions.success,
      updateGroupMembersActions.success,
      removeGroupMembersActions.success,
      addGroupMemberActions.success,
      updateGroupActions.failure,
      updateGroupMembersActions.failure,
      removeGroupMembersActions.failure,
      addGroupMemberActions.failure,
    ),
    () => false,
  );
});

export const groupsReducer = combineReducers({
  groupsById,
  groupNameSearch,
  editingGroupId,
  groupsMembersByGroupId,
  addMemberInputValue,
  addMemberError,
  isGroupUpdating,
});
