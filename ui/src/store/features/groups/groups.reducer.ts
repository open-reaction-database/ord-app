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
import { setActiveGroupIdAction, setEditingGroupIdAction } from './groups.actions.ts';
import { addGroupMemberActions, createGroupActions } from 'store/entities/groups/groups.actions.ts';

const activeGroupId = createReducer<number | null>(null, builder => {
  builder.addCase(setActiveGroupIdAction, (_, action) => action.payload);
});

const editingGroupId = createReducer<number | null>(null, builder => {
  builder.addCase(setEditingGroupIdAction, (_, action) => action.payload);
  builder.addCase(createGroupActions.success, (_, action) => action.payload.id);
});

const isAddingMember = createReducer<boolean>(false, builder => {
  builder.addMatcher(isAnyOf(addGroupMemberActions.request), () => true);
  builder.addMatcher(isAnyOf(addGroupMemberActions.success, addGroupMemberActions.failure), () => false);
});

export const groupsSidebar = combineReducers({
  activeGroupId,
  editingGroupId,
  isAddingMember,
});
