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
import { screen } from '@testing-library/react';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { GroupsListWithRoles } from './GroupsListWithRoles.tsx';
import { USER_ROLES } from 'common/types';
import type { AppState } from 'store/configureAppStore.ts';

const stateWithGroups = {
  entities: {
    groups: {
      groupsById: {
        1: { id: 1, name: 'Alpha', role: USER_ROLES.ADMIN },
        2: { id: 2, name: 'Beta', role: USER_ROLES.VIEWER },
      },
    },
  },
} as unknown as Partial<AppState>;

describe('GroupsListWithRoles', () => {
  it('renders nothing when data is empty', () => {
    renderWithProviders(<GroupsListWithRoles data={[]} />, { preloadedState: {} });
    expect(screen.queryByText('Alpha:')).toBeNull();
  });

  it('renders nothing when the referenced groups are absent from the store', () => {
    renderWithProviders(
      <GroupsListWithRoles
        data={[{ id: 99, name: 'Ghost', role: USER_ROLES.VIEWER }]}
      />,
      {
        preloadedState: {},
      },
    );
    expect(screen.queryByText('Ghost:')).toBeNull();
  });

  it('shows the highest-priority group first and a counter for the rest', () => {
    renderWithProviders(
      <GroupsListWithRoles
        data={[
          { id: 1, name: 'Alpha', role: USER_ROLES.ADMIN },
          { id: 2, name: 'Beta', role: USER_ROLES.VIEWER },
        ]}
      />,
      { preloadedState: stateWithGroups },
    );
    // Admin (Alpha) sorts ahead of Viewer (Beta) and is shown inline.
    expect(screen.getByText('Alpha:')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    // The single remaining group is collapsed into a +1 counter.
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});
