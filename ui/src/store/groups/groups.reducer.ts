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
import { combineReducers, createReducer } from '@reduxjs/toolkit';
import type { ItemsById } from 'common/types';
import { itemsById } from 'common/utils';
import type { Group } from './groups.types.ts';
import {
  createGroupActions,
  getGroupActions,
  getGroupListActions,
  setGroupSearchAction,
  updateGroupActions,
} from './groups.actions.ts';

const getGroupId = (group: Group) => group.id;

const groupNameSearch = createReducer('', builder => {
  builder.addCase(setGroupSearchAction, (_, action) => action.payload);
});

const groupsById = createReducer<ItemsById<Group>>({}, builder => {
  builder.addCase(getGroupListActions.success, (_, action) => itemsById(action.payload, getGroupId));
  [getGroupActions.success, createGroupActions.success, updateGroupActions.success].forEach(action =>
    builder.addCase(action, (state, action) => ({
      ...state,
      [getGroupId(action.payload)]: action.payload,
    })),
  );
});

export const groupsReducer = combineReducers({
  groupsById,
  groupNameSearch,
});
