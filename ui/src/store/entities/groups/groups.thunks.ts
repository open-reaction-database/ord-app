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
import axiosInstance from 'store/axiosInstance.ts';
import type { Group, GroupMember, GroupItem } from './groups.types.ts';
import {
  addGroupMemberActions,
  createGroupActions,
  getGroupActions,
  getGroupListActions,
  getGroupMembersActions,
  removeGroupMembersActions,
  updateGroupActions,
  updateGroupMembersActions,
} from './groups.actions.ts';
import { createThunk, createThunkWithExplicitResult } from 'store/utils';
import { USER_ROLES } from 'common/types';
import { showNotification } from 'common/utils/showNotification.tsx';
import { selectEditingGroupId } from 'store/features/groups/groups.selectors.ts';
import { NotificationVariant } from 'common/types/notification.ts';

export const getGroup = createThunk(getGroupActions, async (_d, _g, groupId) => {
  const group = (await axiosInstance.get<GroupItem>(`/groups/${groupId}`)).data;
  return getGroupActions.success(group);
});

export const getGroupList = createThunk(getGroupListActions, async () => {
  const groups = (await axiosInstance.get<Array<GroupItem>>(`/groups`)).data;
  return getGroupListActions.success(groups);
});

export const createGroup = createThunk(createGroupActions, async (_d, _g, name) => {
  const group = (await axiosInstance.post<GroupItem>('/groups', { name })).data;
  return createGroupActions.success(group);
});

export const getGroupMembers = createThunk(getGroupMembersActions, async (_d, _g, groupId) => {
  const members = (await axiosInstance.get<Array<GroupMember>>(`/groups/${groupId}/members`)).data;
  return getGroupMembersActions.success({ groupId, members });
});

export const updateGroup = createThunkWithExplicitResult(
  updateGroupActions,
  async (dispatch, getState, updatedGroup) => {
    const updatedGroupData = (await axiosInstance.patch<Group>(`/groups/${updatedGroup.id}`, updatedGroup)).data;
    const state = getState();
    const groupId = Number(selectEditingGroupId(state));
    const group = state.entities.groups.groupsById[groupId];
    dispatch(updateGroupActions.success({ id: groupId, name: updatedGroupData.name, role: group.role }));
    showNotification({
      message: `${updatedGroupData.name} group changes have been successfully saved`,
      variant: NotificationVariant.SUCCESS,
    });
  },
);

export const updateGroupMembers = createThunkWithExplicitResult(
  updateGroupMembersActions,
  async (dispatch, getState, memberInfo) => {
    const state = getState();
    const groupId = selectEditingGroupId(state);
    const updatedMember = (await axiosInstance.patch<GroupMember>(`/groups/${groupId}/members`, memberInfo)).data;
    dispatch(updateGroupMembersActions.success({ groupId: Number(groupId), member: updatedMember }));

    showNotification({
      message: `${updatedMember.user.name}'s role has been successfully updated`,
      variant: NotificationVariant.SUCCESS,
    });

    if (state.entities.users.self?.id === updatedMember.user.id) {
      const groupIdNumber = Number(groupId);
      const updatedGroupItem = {
        id: groupIdNumber,
        name: state.entities.groups.groupsById[groupIdNumber].name,
        role: updatedMember.role,
      };
      dispatch(updateGroupActions.success(updatedGroupItem));
    }
  },
);

export const removeGroupMembers = createThunk(removeGroupMembersActions, async (_d, getState, membersId) => {
  const state = getState();
  const groupId = selectEditingGroupId(state);

  await axiosInstance.post(`/groups/${groupId}/members/remove`, membersId);

  showNotification({
    message: 'Member has been removed',
    variant: NotificationVariant.SUCCESS,
  });
  return removeGroupMembersActions.success({ groupId: Number(groupId), membersId });
});

export const addGroupMember = createThunk(addGroupMemberActions, async (_d, getState, identity) => {
  const state = getState();
  const groupId = selectEditingGroupId(state);

  const member = (
    await axiosInstance.post<GroupMember>(`/groups/${groupId}/members`, { identity, role: USER_ROLES.VIEWER })
  ).data;

  showNotification({
    message: `${member.user.name} has been successfully added`,
    variant: NotificationVariant.SUCCESS,
  });
  return addGroupMemberActions.success({ groupId: Number(groupId), member });
});
