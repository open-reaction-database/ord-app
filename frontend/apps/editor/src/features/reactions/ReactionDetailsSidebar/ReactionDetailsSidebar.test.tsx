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
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { emptyReactionData, renderInReactionView } from 'test/renderInReactionView.tsx';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import type { AppState } from 'store/configureAppStore.ts';
import { TemplateReactionProvider } from 'features/templates/TemplateReactionProvider/TemplateReactionProvider.tsx';
import { ReactionSetVariablesButton } from 'features/reactions/ReactionInteractions/ReactionViewDeleteButtons/ReactionSetVariablesButton.tsx';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { DrawerActions } from 'features/reactions/provider/drawer.ts';
import { useDrawer } from 'features/reactions/provider/reactionProvider.hooks.ts';
import { ReactionDetailsSidebar } from './ReactionDetailsSidebar.tsx';

// The real node registry imports the Ketcher structure editor, which does not load under Vitest.
vi.mock('features/reactions/ReactionEntities', () => ({ reactionNodeToComponent: {} }));

// Holds the path it mounted with, as the real form holds the initial values it mounted with.
vi.mock('../ReactionEntities/ReactionEntityForm/ReactionEntityForm.tsx', () => ({
  ReactionEntityForm: ({
    reactionPathComponents,
  }: Readonly<{
    reactionPathComponents: ReactionPathComponents;
  }>) => {
    const [mountedWith] = useState(reactionPathComponents.join('.'));
    return <p>Form for {mountedWith}</p>;
  },
}));

let drawer: DrawerActions;
function Probe() {
  drawer = useDrawer();
  return null;
}

function renderSidebar() {
  return renderInReactionView(
    <>
      <Probe />
      <ReactionDetailsSidebar />
    </>,
  );
}

describe('ReactionDetailsSidebar', () => {
  it('opens the pushed form and closes on Escape', async () => {
    const { getByRole, queryByRole } = renderSidebar();
    expect(queryByRole('dialog')).not.toBeInTheDocument();
    act(() => drawer.push(['notes']));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Notes');
    fireEvent.keyDown(getByRole('dialog'), { key: 'Escape' });
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('mounts a fresh form when another entity replaces the open one', async () => {
    renderSidebar();

    act(() => drawer.set([['notes']]));
    expect(await screen.findByText('Form for notes')).toBeInTheDocument();

    act(() => drawer.set([['provenance']]));
    expect(await screen.findByText('Form for provenance')).toBeInTheDocument();
  });

  it('opens a template’s entity from its Set Variables button', async () => {
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
    expect(await screen.findByRole('dialog')).toHaveTextContent('Form for notes');
  });
});
