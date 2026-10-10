/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, it, expect } from 'vitest';
import {
  selectActiveGroupId,
  selectEditingGroupId,
  selectIsAddingMember,
} from './groups.selectors.ts';
import type { AppState } from 'store/configureAppStore.ts';

interface SidebarState {
  activeGroupId?: number | null;
  editingGroupId?: number | null;
  isAddingMember?: boolean;
}

const buildState = (groupsSidebar: SidebarState): AppState =>
  ({ features: { groupsSidebar } }) as unknown as AppState;

describe('groups sidebar selectors', () => {
  it('reads activeGroupId, editingGroupId, and isAddingMember from the slice', () => {
    const state = buildState({
      activeGroupId: 3,
      editingGroupId: 7,
      isAddingMember: true,
    });
    expect(selectActiveGroupId(state)).toBe(3);
    expect(selectEditingGroupId(state)).toBe(7);
    expect(selectIsAddingMember(state)).toBe(true);
  });

  it('passes through nullish/false defaults', () => {
    const state = buildState({
      activeGroupId: null,
      editingGroupId: null,
      isAddingMember: false,
    });
    expect(selectActiveGroupId(state)).toBeNull();
    expect(selectEditingGroupId(state)).toBeNull();
    expect(selectIsAddingMember(state)).toBe(false);
  });
});
