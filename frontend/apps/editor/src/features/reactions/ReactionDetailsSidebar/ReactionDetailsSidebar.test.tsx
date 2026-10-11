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
import { act, screen } from '@testing-library/react';
import { useState } from 'react';
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
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

describe('ReactionDetailsSidebar', () => {
  it('mounts a fresh form when another entity replaces the open one', async () => {
    const { store } = renderInReactionView(<ReactionDetailsSidebar reactionId={1} />);

    act(() => {
      store.dispatch(setReactionPathComponentsList([['notes']]));
    });
    expect(await screen.findByText('Form for notes')).toBeInTheDocument();

    act(() => {
      store.dispatch(setReactionPathComponentsList([['provenance']]));
    });
    expect(await screen.findByText('Form for provenance')).toBeInTheDocument();
  });
});
