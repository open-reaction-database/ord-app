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
import {
  selectAdminGroupsList,
  selectGroupById,
  selectGroupsByIdsList,
  selectHaveAnyGroups,
  selectMemberRoles,
  selectOrderedGroupsList,
} from './groups.selectors.ts';
import { USER_ROLES } from 'common/types';
import type { GroupItem, GroupMember } from './groups.types.ts';
import type { User } from '../users/users.types.ts';
import type { AppState } from '../../configureAppStore.ts';

const makeGroupItem = (id: number, name: string, role: USER_ROLES): GroupItem => ({
  id,
  name,
  role,
});

const makeUser = (id: number): User => ({
  id,
  name: `user-${id}`,
  email: `user-${id}@example.com`,
  external_id: `ext-${id}`,
  avatar_url: '',
});

const makeMember = (userId: number, role: USER_ROLES): GroupMember => ({
  id: userId * 10,
  role,
  user: makeUser(userId),
});

interface StateParts {
  groupsById?: Record<number, GroupItem>;
  groupNameSearch?: string;
  groupsMembersByGroupId?: Record<number, Array<GroupMember>>;
  self?: User | null;
  editingGroupId?: number | null;
}

const buildState = ({
  groupsById = {},
  groupNameSearch = '',
  groupsMembersByGroupId = {},
  self = null,
  editingGroupId = null,
}: StateParts = {}): AppState =>
  ({
    entities: {
      groups: { groupsById, groupNameSearch, groupsMembersByGroupId },
      users: { self },
    },
    features: {
      groupsSidebar: { editingGroupId },
    },
  }) as unknown as AppState;

describe('selectGroupById', () => {
  it('returns the matching group or undefined', () => {
    const state = buildState({
      groupsById: { 1: makeGroupItem(1, 'Alpha', USER_ROLES.ADMIN) },
    });
    expect(selectGroupById(1)(state)?.name).toBe('Alpha');
    expect(selectGroupById(99)(state)).toBeUndefined();
  });
});

describe('selectHaveAnyGroups', () => {
  it('is false with no groups and true once present', () => {
    expect(selectHaveAnyGroups(buildState())).toBe(false);
    expect(
      selectHaveAnyGroups(
        buildState({ groupsById: { 1: makeGroupItem(1, 'A', USER_ROLES.VIEWER) } }),
      ),
    ).toBe(true);
  });
});

describe('selectGroupsByIdsList', () => {
  it('maps ids to groups and drops unknown ids', () => {
    const state = buildState({
      groupsById: {
        1: makeGroupItem(1, 'A', USER_ROLES.ADMIN),
        2: makeGroupItem(2, 'B', USER_ROLES.VIEWER),
      },
    });
    const result = selectGroupsByIdsList([2, 99, 1])(state);
    expect(result.map(g => g.id)).toEqual([2, 1]);
  });
});

describe('selectOrderedGroupsList', () => {
  const groupsById = {
    1: makeGroupItem(1, 'Charlie', USER_ROLES.ADMIN),
    2: makeGroupItem(2, 'alpha', USER_ROLES.VIEWER),
    3: makeGroupItem(3, 'Bravo', USER_ROLES.EDITOR),
  };

  it('sorts groups case-insensitively by name', () => {
    const result = selectOrderedGroupsList(buildState({ groupsById }));
    expect(result.map(g => g.name)).toEqual(['alpha', 'Bravo', 'Charlie']);
  });

  it('filters by the (case-insensitive) search term before sorting', () => {
    const result = selectOrderedGroupsList(
      buildState({ groupsById, groupNameSearch: 'A' }),
    );
    // 'alpha', 'Bravo', and 'Charlie' all contain an 'a'
    expect(result.map(g => g.name)).toEqual(['alpha', 'Bravo', 'Charlie']);

    const narrow = selectOrderedGroupsList(
      buildState({ groupsById, groupNameSearch: 'bra' }),
    );
    expect(narrow.map(g => g.name)).toEqual(['Bravo']);
  });
});

describe('selectAdminGroupsList', () => {
  it('keeps only groups where the user is admin or editor', () => {
    const groupsById = {
      1: makeGroupItem(1, 'AdminGroup', USER_ROLES.ADMIN),
      2: makeGroupItem(2, 'EditorGroup', USER_ROLES.EDITOR),
      3: makeGroupItem(3, 'ViewerGroup', USER_ROLES.VIEWER),
    };
    const result = selectAdminGroupsList(buildState({ groupsById }));
    expect(result.map(g => g.name)).toEqual(['AdminGroup', 'EditorGroup']);
  });
});

describe('selectMemberRoles', () => {
  it('reports the current user as admin and detects multiple admins', () => {
    const state = buildState({
      editingGroupId: 7,
      self: makeUser(1),
      groupsMembersByGroupId: {
        7: [
          makeMember(1, USER_ROLES.ADMIN),
          makeMember(2, USER_ROLES.ADMIN),
          makeMember(3, USER_ROLES.VIEWER),
        ],
      },
    });
    expect(selectMemberRoles(state)).toEqual({ isAdmin: true, hasTwoAdmins: true });
  });

  it('reports non-admin and single-admin correctly', () => {
    const state = buildState({
      editingGroupId: 7,
      self: makeUser(3),
      groupsMembersByGroupId: {
        7: [makeMember(1, USER_ROLES.ADMIN), makeMember(3, USER_ROLES.VIEWER)],
      },
    });
    expect(selectMemberRoles(state)).toEqual({ isAdmin: false, hasTwoAdmins: false });
  });

  it('defaults to empty roles when the editing group has no members loaded', () => {
    const state = buildState({ editingGroupId: 7, self: makeUser(1) });
    expect(selectMemberRoles(state)).toEqual({ isAdmin: false, hasTwoAdmins: false });
  });
});
