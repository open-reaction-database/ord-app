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
import { ReactionList } from './ReactionList.tsx';
import type { AppState } from 'store/configureAppStore.ts';

// Seed the active dataset's reaction counts; `none` is the count of reactions still being validated.
const stateWithPendingCount = (none: number) =>
  ({
    entities: {
      reactions: { activeDatasetId: 1 },
      datasets: {
        datasetsById: { 1: { id: 1, groups: [], reactions_count: { total: 4, invalid: 1, valid: 3 - none, none } } },
      },
    },
  }) as unknown as Partial<AppState>;

describe('ReactionList', () => {
  it('mounts without crashing', () => {
    const { container } = renderWithProviders(<ReactionList />);
    expect(container).toBeInTheDocument();
  });

  it('shows a validation-in-progress loader instead of the toggle while reactions are pending (#622)', () => {
    renderWithProviders(<ReactionList />, { preloadedState: stateWithPendingCount(2) });
    expect(screen.getByText('Reaction validation in progress')).toBeInTheDocument();
    expect(screen.queryByText('Show Invalid Only')).toBeNull();
  });

  it('shows the Show Invalid Only toggle once validation has completed (#622)', () => {
    renderWithProviders(<ReactionList />, { preloadedState: stateWithPendingCount(0) });
    expect(screen.getByText('Show Invalid Only')).toBeInTheDocument();
    expect(screen.queryByText('Reaction validation in progress')).toBeNull();
  });
});
