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
import { screen, fireEvent, waitFor } from '@testing-library/react';
import {
  renderWithReaction,
  stubReactionActions,
} from '#testing/renderWithReaction.tsx';
import { ReactionEntityForm } from './ReactionEntityForm.tsx';
import { reactionSidebarInfo } from '#reaction/view/ReactionEntities/sidebarInfo/sidebarInfo.models.ts';
import { ReactionNodeEntity } from '#reaction/model/reactions.types.ts';

// Stub the form registry to a single plain text field: the field nodes aren't what's under test
// here; the save-and-close wiring is. A real input gives the keyboard-shortcut test a realistic
// focus target (a field, not the button).
vi.mock('#reaction/view/ReactionEntities/index.ts', () => ({
  ReactionEntityBaseNode: () => <input aria-label="Field" />,
  reactionEntityToForm: new Proxy({}, { get: () => [{ name: 'field' }] }),
}));

const provenanceSidebarInfo = reactionSidebarInfo.find(
  info => info.entityName === ReactionNodeEntity.Provenance,
)!;

const onFormClose = vi.fn();

function renderForm() {
  const actions = stubReactionActions();
  renderWithReaction(
    <ReactionEntityForm
      isHidden={false}
      reactionPathComponents={provenanceSidebarInfo.pathComponents}
      sidebarInfo={provenanceSidebarInfo}
      onFormClose={onFormClose}
      onSetFormDirty={() => {}}
    />,
    { actions },
  );
  return actions;
}

describe('ReactionEntityForm — Save and Close (#550)', () => {
  it('saves the form and closes the sidebar when clicked', async () => {
    const actions = renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Save and Close' }));

    await waitFor(() => expect(actions.update).toHaveBeenCalledTimes(1));
    expect(actions.update.mock.calls[0][0]).toEqual(['provenance']);
    expect(onFormClose).toHaveBeenCalledTimes(1);
  });

  it.each([
    { label: 'Ctrl+Enter', mods: { ctrlKey: true } },
    { label: 'Cmd+Enter', mods: { metaKey: true } },
  ])('saves and closes on $label from a focused field', async ({ mods }) => {
    const actions = renderForm();

    // Fire from a real form field (where a user would be typing), not the button — the handler
    // lives on the parent <form> and catches the bubbling keydown.
    fireEvent.keyDown(screen.getByLabelText('Field'), { key: 'Enter', ...mods });

    await waitFor(() => expect(actions.update).toHaveBeenCalledTimes(1));
    expect(actions.update.mock.calls[0][0]).toEqual(['provenance']);
    expect(onFormClose).toHaveBeenCalledTimes(1);
  });
});
