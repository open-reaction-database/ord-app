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
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { TemplateHeader } from './TemplateHeader.tsx';
import type { AppState } from 'store/configureAppStore.ts';

// The reaction preview and the action menu are exercised elsewhere; stub them so this test focuses
// on the header's name + enumeration-readiness badge.
vi.mock('common/components/ReactionPreview/ReactionPreview.tsx', () => ({
  ReactionPreview: () => <div data-testid="reaction-preview" />,
}));
vi.mock('features/templates/TemplateHeaderActions/TemplateHeaderActions', () => ({
  TemplateHeaderActions: () => <div data-testid="template-header-actions" />,
}));

const stateWithVariables = (variables: object): { preloadedState: AppState } => ({
  preloadedState: {
    entities: {
      reactions: {
        reactionsById: {
          template_1: {
            id: 1,
            data: {},
            name: 'My Template',
            variables,
            modified_at: '2025-06-15T14:30:00Z',
          },
        },
      },
    },
  } as unknown as AppState,
});

describe('TemplateHeader', () => {
  it('shows the template name and a not-ready badge when there are no variables', () => {
    const { getByText } = renderWithProviders(
      <TemplateHeader templateId="template_1" />,
      stateWithVariables({}),
    );
    expect(getByText('My Template')).toBeInTheDocument();
    expect(getByText('Not Ready for Enumeration: No Variables')).toBeInTheDocument();
  });

  it('shows a valid badge once the template has at least one variable', () => {
    const { getByText } = renderWithProviders(
      <TemplateHeader templateId="template_1" />,
      stateWithVariables({ v1: { name: 'reagent' } }),
    );
    expect(getByText('Template is valid')).toBeInTheDocument();
  });

  it('shows the last-modified date formatted in the user timezone (#619)', () => {
    const { getByText } = renderWithProviders(
      <TemplateHeader templateId="template_1" />,
      stateWithVariables({}),
    );
    expect(getByText('Last Modified')).toBeInTheDocument();
    // DD.MM.YYYY hh:mm a (DATE_TIME_HUMAN_FORMAT); exact value is timezone-dependent, so match the shape.
    expect(getByText(/\d{2}\.\d{2}\.\d{4} \d{2}:\d{2} (am|pm)/)).toBeInTheDocument();
  });
});
