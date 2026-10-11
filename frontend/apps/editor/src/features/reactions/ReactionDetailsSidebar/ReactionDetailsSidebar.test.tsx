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
import { renderWithReaction } from '@open-reaction-database/ui/testing';
import type { ReactionPathComponents } from '@open-reaction-database/ui/reaction/model';
import { type DrawerActions, useDrawer } from '@open-reaction-database/ui/reaction';
import { ReactionDetailsSidebar } from './ReactionDetailsSidebar.tsx';

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
});
