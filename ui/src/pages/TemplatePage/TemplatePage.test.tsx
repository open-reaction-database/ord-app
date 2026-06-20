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
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from 'test/renderWithMantine.tsx';

// Drives the three branches of the page (#496): the template lookup and the templates-loaded flag.
const control = vi.hoisted(() => ({ template: undefined as unknown, loaded: false }));

vi.mock('wouter', () => ({ useParams: () => ({ templateId: '999' }) }));
vi.mock('react-redux', () => ({ useSelector: (selector: (state: unknown) => unknown) => selector(undefined) }));
vi.mock('store/entities/reactions/reactions.selectors.ts', () => ({
  selectReactionById: () => () => control.template,
}));
vi.mock('store/entities/templates/templates.selectors.ts', () => ({
  selectAreTemplatesLoaded: () => control.loaded,
}));

// Stub the full-page 404 and the heavy template subtree so the test stays focused on the page's
// branch decision rather than its children's internals.
vi.mock('pages/NotFound/NotFoundPage.tsx', () => ({
  NotFoundPage: ({ rejectValue }: Readonly<{ rejectValue?: { errorCode?: number } }>) => (
    <div data-testid="not-found">{rejectValue?.errorCode}</div>
  ),
}));
vi.mock('common/components/PageContainer/PageContainer.tsx', () => ({
  PageContainer: ({ children }: Readonly<{ children: React.ReactNode }>) => (
    <div data-testid="page-container">{children}</div>
  ),
}));
vi.mock('features/templates/TemplateHeader/TemplateHeader.tsx', () => ({
  TemplateHeader: () => <div data-testid="template-header" />,
}));
vi.mock('features/reactions/ReactionEntities/ReactionTabs/ReactionTabs.tsx', () => ({ ReactionTabs: () => null }));
vi.mock('features/reactions/ReactionDetailsSidebar/ReactionDetailsSidebar.tsx', () => ({
  ReactionDetailsSidebar: () => null,
}));
vi.mock('features/templates/VariablesSidebar/VariablesSidebar.tsx', () => ({ VariablesSidebar: () => null }));
vi.mock('features/reactions/ReactionInteractions/ReactionValueLabel/TemplateReactionValueLabel.tsx', () => ({
  TemplateReactionValueLabelWrapper: () => null,
}));
vi.mock('features/reactions/ReactionInteractions/ReactionViewDeleteButtons/ReactionSetVariablesButton.tsx', () => ({
  ReactionSetVariablesButton: () => null,
}));
vi.mock('features/reactions/ReactionInteractions/ReactionValueLabel/DatasetReactionValueLable.tsx', () => ({
  DatasetReactionValueLabel: () => null,
}));

import { TemplatePage } from './TemplatePage.tsx';

beforeEach(() => {
  control.template = undefined;
  control.loaded = false;
});

describe('TemplatePage (#496 — 404 for a missing template)', () => {
  it('shows a 404 once templates are loaded and the id is unknown', () => {
    control.loaded = true;
    control.template = undefined;
    renderWithMantine(<TemplatePage />);
    expect(screen.getByTestId('not-found')).toHaveTextContent('404');
  });

  it('does not flash a 404 while templates are still loading', () => {
    control.loaded = false;
    control.template = undefined;
    renderWithMantine(<TemplatePage />);
    expect(screen.queryByTestId('not-found')).toBeNull();
    expect(screen.getByTestId('page-container')).toBeInTheDocument();
  });

  it('renders the template content when the template exists', () => {
    control.loaded = true;
    control.template = { id: 'template_999', name: 'My Template', data: { outcomes: [] } };
    renderWithMantine(<TemplatePage />);
    expect(screen.queryByTestId('not-found')).toBeNull();
    expect(screen.getByTestId('template-header')).toBeInTheDocument();
  });
});
