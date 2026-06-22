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
import { isAxiosError } from 'axios';
import {
  ADD_MEMBER_ERROR,
  type Group,
  type GroupMember,
  type GroupItem,
} from './groups.types.ts';
import {
  addGroupMemberActions,
  createGroupActions,
  getGroupListActions,
  getGroupMembersActions,
  removeGroupMembersActions,
  renameGroupActions,
  updateGroupMembersActions,
} from './groups.actions.ts';
import { createThunk, createThunkWithExplicitResult } from 'store/utils';
import { USER_ROLES } from 'common/types';
import { showNotification } from 'common/utils/showNotification.tsx';
import { selectEditingGroupId } from 'store/features/groups/groups.selectors.ts';
import { NotificationVariant } from 'common/types/notification.ts';

export const getGroupList = createThunk(getGroupListActions, () => async () => {
  const groups = (await axiosInstance.get<Array<GroupItem>>(`/groups`)).data;
  return getGroupListActions.success(groups);
});

export const createGroup = createThunk(createGroupActions, name => async dispatch => {
  const { id } = (await axiosInstance.post<GroupItem>('/groups', { name })).data;

  dispatch(getGroupList());
  return createGroupActions.success(id);
});

export const getGroupMembers = createThunk(
  getGroupMembersActions,
  groupId => async () => {
    const members = (
      await axiosInstance.get<Array<GroupMember>>(`/groups/${groupId}/members`)
    ).data;
    return getGroupMembersActions.success({ groupId, members });
  },
);

export const renameGroup = createThunkWithExplicitResult(
  renameGroupActions,
  updatedGroup => async dispatch => {
    const { name, id } = updatedGroup;
    await axiosInstance.patch<Group>(`/groups/${id}`, updatedGroup);
    dispatch(getGroupList());
    dispatch(renameGroupActions.success());
    showNotification({
      message: `${name} group changes have been successfully saved`,
      variant: NotificationVariant.SUCCESS,
    });
  },
);

export const updateGroupMembers = createThunkWithExplicitResult(
  updateGroupMembersActions,
  memberInfo => async (dispatch, getState) => {
    const state = getState();
    const groupId = selectEditingGroupId(state);
    const updatedMember = (
      await axiosInstance.patch<GroupMember>(`/groups/${groupId}/members`, memberInfo)
    ).data;
    dispatch(getGroupList());
    dispatch(
      updateGroupMembersActions.success({
        groupId: Number(groupId),
        member: updatedMember,
      }),
    );
    showNotification({
      message: `${updatedMember.user.name}'s role has been successfully updated`,
      variant: NotificationVariant.SUCCESS,
    });
  },
);

export const removeGroupMembers = createThunk(
  removeGroupMembersActions,
  membersId => async (_d, getState) => {
    const state = getState();
    const groupId = selectEditingGroupId(state);

    await axiosInstance.post(`/groups/${groupId}/members/remove`, membersId);

    showNotification({
      message: 'Member has been removed',
      variant: NotificationVariant.SUCCESS,
    });
    return removeGroupMembersActions.success({ groupId: Number(groupId), membersId });
  },
);

export const addGroupMember = createThunk(
  addGroupMemberActions,
  identity => async (_d, getState) => {
    const state = getState();
    const groupId = selectEditingGroupId(state);

    try {
      const member = (
        await axiosInstance.post<GroupMember>(`/groups/${groupId}/members`, {
          identity,
          role: USER_ROLES.VIEWER,
        })
      ).data;

      showNotification({
        message: `${member.user.name} has been successfully added`,
        variant: NotificationVariant.SUCCESS,
      });
      return addGroupMemberActions.success({ groupId: Number(groupId), member });
    } catch (error) {
      // The backend returns 409 when the user is already a member of the group and 404
      // when no user with the given identity exists; surface the right inline message.
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 409) {
        return addGroupMemberActions.failure(ADD_MEMBER_ERROR.ALREADY_MEMBER);
      }
      if (status === 404) {
        return addGroupMemberActions.failure(ADD_MEMBER_ERROR.NOT_FOUND);
      }
      // Anything else (500, 403, network error, ...) is unexpected: keep it visible with a
      // toast carrying the backend detail rather than silently mislabeling it as "no user".
      const detail = isAxiosError(error) ? error.response?.data?.detail : undefined;
      showNotification({
        variant: NotificationVariant.ERROR,
        message:
          typeof detail === 'string'
            ? detail
            : 'Failed to add the user. Please try again.',
      });
      return addGroupMemberActions.failure(ADD_MEMBER_ERROR.GENERIC);
    }
  },
);
