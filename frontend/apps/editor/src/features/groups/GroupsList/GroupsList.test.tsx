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
import { GroupsList } from './GroupsList.tsx';
import { USER_ROLES } from 'common/types';
import type { AppState } from 'store/configureAppStore.ts';

const withGroups = {
  entities: {
    groups: {
      groupsById: { 1: { id: 1, name: 'Alpha', role: USER_ROLES.ADMIN } },
      groupNameSearch: '',
    },
  },
} as unknown as Partial<AppState>;

describe('GroupsList', () => {
  it('lists the groups from the store', () => {
    renderWithProviders(<GroupsList />, { preloadedState: withGroups });
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });
});
