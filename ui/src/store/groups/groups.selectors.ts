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
import { selectSelf } from 'store/users/users.selectors';
import type { AppState } from '../configureAppStore';
import { createSelector } from '@reduxjs/toolkit';
import { USER_ROLES } from 'common/types';

const selectRootState = (state: AppState) => state.groups;

export const selectGroupSearch = (state: AppState) => selectRootState(state).groupNameSearch;

export const selectGroupsByIds = (state: AppState) => selectRootState(state).groupsById;

export const selectGroupById = (id: string) => (state: AppState) => selectGroupsByIds(state)[id];

export const selectActiveGroupId = (state: AppState) => selectRootState(state).activeGroupId;

export const selectEditingGroupId = (state: AppState) => selectRootState(state).editingGroupId;

export const selectHaveAnyGroups = createSelector([selectGroupsByIds], groups => Object.keys(groups).length > 0);

export const selectOrderedGroupsList = createSelector([selectGroupSearch, selectGroupsByIds], (search, groups) => {
  const lowerCaseSearch = search.toLowerCase();
  const filteredList =
    search !== ''
      ? Object.values(groups).filter(group => group.name.toLowerCase().includes(lowerCaseSearch))
      : Object.values(groups);
  return filteredList.sort((a, b) => a.name.localeCompare(b.name));
});

export const selectGroupMembersByGroupId = (id: number) => (state: AppState) =>
  selectRootState(state).groupsMembersByGroupId[id];

export const selectAddMemberInputValue = (state: AppState) => selectRootState(state).addMemberInputValue;

export const selectAddMemberError = (state: AppState) => selectRootState(state).addMemberError;

export const selectIsGroupUpdating = (state: AppState) => selectRootState(state).isGroupUpdating;

export const selectMemberRoles = createSelector(
  [selectEditingGroupId, (state: AppState) => state, selectSelf],
  (editingGroupId, state, currentUser) => {
    const groupMembers = editingGroupId !== null ? selectGroupMembersByGroupId(editingGroupId)(state) : [];
    const isAdmin = groupMembers.find(member => member.user.id === currentUser?.id)?.role === USER_ROLES.ADMIN;
    const hasTwoAdmins = groupMembers.filter(member => member.role === USER_ROLES.ADMIN).length >= 2;

    return { isAdmin, hasTwoAdmins };
  },
);
