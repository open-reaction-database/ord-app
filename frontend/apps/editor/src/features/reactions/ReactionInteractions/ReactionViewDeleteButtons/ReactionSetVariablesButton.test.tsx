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
import { fireEvent, screen } from '@testing-library/react';
import { ReactionDetailsSidebar } from '@open-reaction-database/ui/reaction';
import { TemplateReactionProvider } from 'features/templates/TemplateReactionProvider/TemplateReactionProvider.tsx';
import { emptyReactionData } from '@open-reaction-database/ui/testing';
import type { AppState } from 'store/configureAppStore.ts';
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { ReactionSetVariablesButton } from './ReactionSetVariablesButton.tsx';

// Smoke test: the component mounts inside the reaction view's providers without throwing.
const Component = ReactionSetVariablesButton as unknown as () => JSX.Element;

describe('ReactionSetVariablesButton', () => {
  it('mounts without crashing', () => {
    const { container } = renderInReactionView(<Component />);
    expect(container).toBeInTheDocument();
  });

  it('opens the template’s entity in the drawer', async () => {
    renderWithProviders(
      <TemplateReactionProvider templateId="template_1">
        <ReactionSetVariablesButton
          entityName="Notes"
          pathComponents={['notes']}
        />
        <ReactionDetailsSidebar />
      </TemplateReactionProvider>,
      {
        preloadedState: {
          entities: {
            reactions: {
              reactionsById: {
                template_1: { id: 1, data: emptyReactionData(), variables: {} },
              },
            },
          },
        } as unknown as AppState,
      },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Set Variables' }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('Notes');
  });
});
