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
import axiosInstance from 'common/config/axiosConfig';
import type { Group } from './groups.types';
import { createGroupActions, getGroupActions, getGroupListActions, updateGroupActions } from './groups.actions';
import { createThunk } from 'common/store';

export const getGroup = createThunk(getGroupActions, async (_d, _g, groupId) => {
  const group = (await axiosInstance.get<Group>(`/groups/${groupId}`)).data;
  return getGroupActions.success(group);
});

export const getGroupList = createThunk(getGroupListActions, async () => {
  const groups = (await axiosInstance.get<Group[]>(`/groups`)).data;
  return getGroupListActions.success(groups);
});

export const createGroup = createThunk(createGroupActions, async (_d, _g, name) => {
  const group = (await axiosInstance.post<Group>('/groups', { name })).data;
  return createGroupActions.success(group);
});

export const updateGroup = createThunk(updateGroupActions, async (_d, _g, updatedGroup) => {
  const group = (await axiosInstance.patch<Group>(`/groups/${updatedGroup.id}`, updatedGroup)).data;
  return updateGroupActions.success(group);
});
