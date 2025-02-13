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
import { createActionFactory } from 'store/utils';
import type { Group, GroupMember } from './groups.types.ts';
import type { USER_ROLES } from 'common/types';

const { createAsyncAction, createAction } = createActionFactory('groups');

export const getGroupActions = createAsyncAction<number, Group>('get');

export const getGroupListActions = createAsyncAction<void, Array<Group>>('list');

export const createGroupActions = createAsyncAction<string, Group>('create');

export const updateGroupActions = createAsyncAction<Partial<Group>, Group>('update');

export const setGroupSearchAction = createAction<string>('set_search');

export const setActiveGroupIdAction = createAction<number | null>('set_active_group_id');

export const setEditingGroupIdAction = createAction<number | null>('set_editing_group_id');

export const getGroupMembersActions = createAsyncAction<number, { groupId: number; members: Array<GroupMember> }>(
  'get_group_members',
);

export const updateGroupMembersActions = createAsyncAction<
  { user_id: number; role: USER_ROLES },
  { groupId: number; member: GroupMember }
>('update_group_members');

export const removeGroupMembersActions = createAsyncAction<
  Array<number>,
  { groupId: number; membersId: Array<number> }
>('remove_group_members');

export const addGroupMemberActions = createAsyncAction<string, { groupId: number; member: GroupMember }>(
  'add_group_member',
);

export const resetAddMemberErrorAction = createAction('set_add_member_error');

export const setAddMemberInputValueAction = createAction<string>('set_add_member_input');
