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
import { groupsSidebar } from './groups.reducer.ts';
import { setActiveGroupIdAction, setEditingGroupIdAction } from './groups.actions.ts';
import {
  addGroupMemberActions,
  createGroupActions,
} from 'store/entities/groups/groups.actions.ts';
import type { GroupMember } from 'store/entities/groups/groups.types.ts';

const initialState = () => groupsSidebar(undefined, { type: '@@INIT' });

describe('groupsSidebar reducer', () => {
  it('returns the initial state', () => {
    expect(initialState()).toEqual({
      activeGroupId: null,
      editingGroupId: null,
      isAddingMember: false,
    });
  });

  describe('activeGroupId', () => {
    it('follows the set action (including reset to null)', () => {
      let state = groupsSidebar(initialState(), setActiveGroupIdAction(5));
      expect(state.activeGroupId).toBe(5);
      state = groupsSidebar(state, setActiveGroupIdAction(null));
      expect(state.activeGroupId).toBeNull();
    });
  });

  describe('editingGroupId', () => {
    it('follows the set action and jumps to a newly created group id', () => {
      let state = groupsSidebar(initialState(), setEditingGroupIdAction(2));
      expect(state.editingGroupId).toBe(2);
      state = groupsSidebar(state, createGroupActions.success(9));
      expect(state.editingGroupId).toBe(9);
    });
  });

  describe('isAddingMember', () => {
    it('toggles around the add-member request', () => {
      let state = groupsSidebar(
        initialState(),
        addGroupMemberActions.request('a@b.com'),
      );
      expect(state.isAddingMember).toBe(true);
      state = groupsSidebar(
        state,
        addGroupMemberActions.success({ groupId: 1, member: {} as GroupMember }),
      );
      expect(state.isAddingMember).toBe(false);

      state = groupsSidebar(initialState(), addGroupMemberActions.request('a@b.com'));
      state = groupsSidebar(state, addGroupMemberActions.failure('GENERIC'));
      expect(state.isAddingMember).toBe(false);
    });
  });
});
