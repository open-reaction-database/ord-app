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
import {
  renderWithReaction,
  stubReactionActions,
} from '#testing/renderWithReaction.tsx';
import type { ReactionPathComponents } from '#reaction/model/reactionPathComponents.ts';
import { type DrawerActions, type DrawerStack } from '#reaction/provider/drawer.ts';
import {
  useDrawer,
  useDrawerStack,
} from '#reaction/provider/reactionProvider.hooks.ts';
import { fullReactionSnapshot } from '#testing/fullReactionSnapshot.ts';
import { ReactionDetailsSidebar } from './ReactionDetailsSidebar.tsx';

// Holds the path it mounted with, as the real form holds the initial values it mounted with.
vi.mock(
  '#reaction/view/ReactionEntities/ReactionEntityForm/ReactionEntityForm.tsx',
  () => ({
    ReactionEntityForm: ({
      reactionPathComponents,
    }: Readonly<{
      reactionPathComponents: ReactionPathComponents;
    }>) => {
      const [mountedWith] = useState(reactionPathComponents.join('.'));
      return <p>Form for {mountedWith}</p>;
    },
  }),
);

let drawer: DrawerActions;
let drawerStack: DrawerStack;
function Probe() {
  drawer = useDrawer();
  drawerStack = useDrawerStack();
  return null;
}

function renderSidebar() {
  return renderWithReaction(
    <>
      <Probe />
      <ReactionDetailsSidebar />
    </>,
    { editable: true },
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

  it('closes the form whose entity its title removes', async () => {
    const snapshot = fullReactionSnapshot();
    const [inputKey] = Object.keys(snapshot.data.inputs);
    const actions = stubReactionActions();
    renderWithReaction(
      <>
        <Probe />
        <ReactionDetailsSidebar />
      </>,
      { snapshot, actions },
    );
    act(() => drawer.set([['notes'], ['inputs', inputKey]]));
    fireEvent.click(await screen.findByRole('button', { name: 'Remove Input' }));
    fireEvent.click(await screen.findByRole('button', { name: 'OK' }));
    expect(actions.remove).toHaveBeenCalledWith(['inputs', inputKey]);
    expect(drawerStack).toEqual([['notes']]);
  });
});
