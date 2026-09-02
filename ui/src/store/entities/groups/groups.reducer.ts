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
import type { GroupMember, GroupItem, GroupTrash } from './groups.types.ts';
import {
  addGroupMemberActions,
  emptyGroupTrashActions,
  getGroupListActions,
  getGroupMembersActions,
  getGroupTrashActions,
  removeGroupMembersActions,
  resetAddMemberErrorAction,
  restoreGroupTrashItemActions,
  setAddMemberInputValueAction,
  setEditingGroupIdAction,
  setGroupSearchAction,
  renameGroupActions,
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
  builder.addCase(getGroupListActions.success, (_, action) =>
    itemsById(action.payload, getGroupId),
  );
});

const groupsMembersByGroupId = createReducer<ItemsById<Array<GroupMember>>>(
  {},
  builder => {
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

      const updatedMembers = state[groupId].filter(
        member => !membersId.includes(member.user.id),
      );

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
  },
);

const addMemberInputValue = createReducer('', builder => {
  builder.addCase(setAddMemberInputValueAction, (_, action) => action.payload);
  builder.addCase(addGroupMemberActions.success, () => '');
});

const addMemberError = createReducer<string | null>(null, builder => {
  builder.addCase(addGroupMemberActions.failure, (_, action) => action.payload);
  builder.addCase(addGroupMemberActions.success, () => null);
  builder.addCase(resetAddMemberErrorAction, () => null);
});

const isGroupUpdating = createReducer<boolean>(false, builder => {
  builder.addMatcher(
    isAnyOf(
      renameGroupActions.request,
      updateGroupMembersActions.request,
      removeGroupMembersActions.request,
      addGroupMemberActions.request,
    ),
    () => true,
  );
  builder.addMatcher(
    isAnyOf(
      renameGroupActions.success,
      updateGroupMembersActions.success,
      removeGroupMembersActions.success,
      addGroupMemberActions.success,
      renameGroupActions.failure,
      updateGroupMembersActions.failure,
      removeGroupMembersActions.failure,
      addGroupMemberActions.failure,
    ),
    () => false,
  );
});

const initialTrash: GroupTrash = { datasets: [], reactions: [] };

const trash = createReducer<GroupTrash>(initialTrash, builder => {
  builder.addCase(getGroupTrashActions.success, (_, action) => action.payload.trash);
  builder.addCase(restoreGroupTrashItemActions.success, (state, action) => {
    const collection =
      action.payload.kind === 'dataset' ? state.datasets : state.reactions;
    const itemIndex = collection.findIndex(item => item.id === action.payload.id);
    if (itemIndex >= 0) collection.splice(itemIndex, 1);
  });
  builder.addCase(emptyGroupTrashActions.success, () => initialTrash);
});

const isTrashLoading = createReducer<boolean>(false, builder => {
  builder.addCase(getGroupTrashActions.request, () => true);
  builder.addMatcher(
    isAnyOf(getGroupTrashActions.success, getGroupTrashActions.failure),
    () => false,
  );
});

const isTrashUpdating = createReducer<boolean>(false, builder => {
  builder.addMatcher(
    isAnyOf(restoreGroupTrashItemActions.request, emptyGroupTrashActions.request),
    () => true,
  );
  builder.addMatcher(
    isAnyOf(
      restoreGroupTrashItemActions.success,
      restoreGroupTrashItemActions.failure,
      emptyGroupTrashActions.success,
      emptyGroupTrashActions.failure,
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
  trash,
  isTrashLoading,
  isTrashUpdating,
});
