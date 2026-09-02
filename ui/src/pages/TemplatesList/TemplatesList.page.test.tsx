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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import type { AppState } from 'store/configureAppStore.ts';
import { TemplatesListPage } from './TemplatesList.page.tsx';

vi.mock('common/components/PageContainer/PageContainer.tsx', () => ({
  PageContainer: ({ children }: Readonly<{ children: React.ReactNode }>) => (
    <div>{children}</div>
  ),
}));
vi.mock('features/templates/EntitiesMenu/EntitiesMenu', () => ({
  EntitiesMenu: () => null,
}));
vi.mock('./TemplatesTopActions/TemplatesTopActions.tsx', () => ({
  TemplatesTopActions: () => null,
}));
vi.mock('features/templates/TemplateHeaderActions/TemplateHeaderActions.tsx', () => ({
  TemplateHeaderActions: () => null,
}));
vi.mock('common/components/ReactionPreview/ReactionPreview.tsx', () => ({
  ReactionPreview: () => <div data-testid="reaction-preview" />,
}));

const makeTemplate = (id: string, name: string) => ({
  id,
  name,
  data: {},
  variables: {},
  summary: { conditions: '', provenance: {}, summary: {} },
  previews: {},
  modified_at: '2025-06-15T14:30:00Z',
});

const preloadedState = {
  entities: {
    templates: {
      templatesOrder: ['template_1', 'template_2', 'template_3'],
      isTemplateCreating: false,
      areTemplatesLoaded: true,
    },
    reactions: {
      reactionsById: {
        template_1: makeTemplate('template_1', 'benzaldehyde coupling'),
        template_2: makeTemplate('template_2', 'suzuki cross-coupling'),
        template_3: makeTemplate('template_3', 'amide formation'),
      },
    },
  },
} as unknown as AppState;

describe('TemplatesListPage search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes an accessible name on the search textbox', () => {
    renderWithProviders(<TemplatesListPage />, { preloadedState });
    expect(
      screen.getByRole('textbox', { name: 'Search saved templates' }),
    ).toBeInTheDocument();
  });

  it('shows all templates initially', () => {
    renderWithProviders(<TemplatesListPage />, { preloadedState });
    expect(screen.getByText('benzaldehyde coupling')).toBeInTheDocument();
    expect(screen.getByText('suzuki cross-coupling')).toBeInTheDocument();
    expect(screen.getByText('amide formation')).toBeInTheDocument();
  });

  it('filters to matching names after debounce', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TemplatesListPage />, { preloadedState });

    await user.type(
      screen.getByRole('textbox', { name: 'Search saved templates' }),
      'benz',
    );

    await waitFor(
      () => {
        // Title text is split across a <mark> when highlighted; match on textContent.
        expect(
          screen.getByText((_, el) => el?.textContent === 'benzaldehyde coupling'),
        ).toBeInTheDocument();
        expect(
          screen.queryByText((_, el) => el?.textContent === 'suzuki cross-coupling'),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText((_, el) => el?.textContent === 'amide formation'),
        ).not.toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('keeps the full list for a whitespace-only query', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TemplatesListPage />, { preloadedState });

    await user.type(
      screen.getByRole('textbox', { name: 'Search saved templates' }),
      '   ',
    );

    await waitFor(
      () => {
        expect(screen.getByText('benzaldehyde coupling')).toBeInTheDocument();
        expect(screen.getByText('suzuki cross-coupling')).toBeInTheDocument();
        expect(screen.getByText('amide formation')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('shows the empty state for a nonsense query and clear restores the list', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TemplatesListPage />, { preloadedState });

    await user.type(
      screen.getByRole('textbox', { name: 'Search saved templates' }),
      'zzzz-no-match',
    );

    await waitFor(
      () => {
        expect(
          screen.getByText('No saved templates match your search.'),
        ).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    // Input X and empty-state button share the same accessible name.
    await user.click(screen.getAllByRole('button', { name: 'Clear search' })[0]);

    expect(screen.getByText('benzaldehyde coupling')).toBeInTheDocument();
    expect(screen.getByText('suzuki cross-coupling')).toBeInTheDocument();
    expect(screen.getByText('amide formation')).toBeInTheDocument();
    expect(
      screen.queryByText('No saved templates match your search.'),
    ).not.toBeInTheDocument();
  });

  it('shows an input clear control once there is text and clears immediately', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TemplatesListPage />, { preloadedState });

    expect(
      screen.queryByRole('button', { name: 'Clear search' }),
    ).not.toBeInTheDocument();

    await user.type(
      screen.getByRole('textbox', { name: 'Search saved templates' }),
      'benz',
    );

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(
      screen.getByRole('textbox', { name: 'Search saved templates' }),
    ).toHaveValue('');
    expect(screen.getByText('benzaldehyde coupling')).toBeInTheDocument();
    expect(screen.getByText('suzuki cross-coupling')).toBeInTheDocument();
    expect(screen.getByText('amide formation')).toBeInTheDocument();
  });

  it('highlights the matched substring in titles after debounce', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TemplatesListPage />, { preloadedState });

    expect(document.querySelector('mark')).not.toBeInTheDocument();

    await user.type(
      screen.getByRole('textbox', { name: 'Search saved templates' }),
      'benz',
    );

    await waitFor(
      () => {
        const mark = document.querySelector('mark');
        expect(mark).toBeInTheDocument();
        expect(mark).toHaveTextContent('benz');
      },
      { timeout: 1000 },
    );
  });

  it('removes title highlights when search is cleared', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TemplatesListPage />, { preloadedState });

    await user.type(
      screen.getByRole('textbox', { name: 'Search saved templates' }),
      'benz',
    );

    await waitFor(() => expect(document.querySelector('mark')).toBeInTheDocument(), {
      timeout: 1000,
    });

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(document.querySelector('mark')).not.toBeInTheDocument();
  });
});
