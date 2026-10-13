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

// Stub the form registry to an empty form: the field nodes aren't what's under test here; the
// paste-submit wiring is.
vi.mock('#reaction/view/ReactionEntities/index.ts', () => ({
  ReactionEntityBaseNode: () => null,
  reactionEntityToForm: new Proxy({}, { get: () => [] }),
}));

// Drive the paste flow through a stubbed clipboard read and capture what the form saves.
const pasteReactionPartMock = vi.fn();
vi.mock('./reactionEntityForm.utils.ts', async importActual => ({
  ...((await importActual()) as Record<string, unknown>),
  pasteReactionPart: (...args: Array<unknown>) => pasteReactionPartMock(...args),
}));

const provenanceSidebarInfo = reactionSidebarInfo.find(
  info => info.entityName === ReactionNodeEntity.Provenance,
)!;

describe('ReactionEntityForm — Paste Chunk filtering', () => {
  it('submits the filtered chunk, dropping fields the sidebar excludes (e.g. recordModified)', async () => {
    // A clipboard chunk that includes recordModified — which the Provenance sidebar filters out
    // (it is edited in its own sidebar) — plus an ordinary field that must survive the paste.
    pasteReactionPartMock.mockResolvedValue([
      { doi: '10.0000/paste-test', recordModified: { time: { value: 'leaked' } } },
      'clipboard-text',
    ]);

    const actions = stubReactionActions();
    renderWithReaction(
      <ReactionEntityForm
        isHidden={false}
        reactionPathComponents={provenanceSidebarInfo.pathComponents}
        sidebarInfo={provenanceSidebarInfo}
        onFormClose={() => {}}
        onSetFormDirty={() => {}}
      />,
      { actions },
    );

    fireEvent.click(screen.getByRole('button', { name: 'Paste Chunk' }));
    fireEvent.click(screen.getByRole('button', { name: 'Paste' }));

    await waitFor(() => expect(actions.update).toHaveBeenCalled());

    const [pathComponents, newValue] = actions.update.mock.calls[0];
    expect(pathComponents).toEqual(['provenance']);
    // The bug submitted the raw chunk, leaking recordModified into the merge; the fix submits filtered values.
    expect(newValue).not.toHaveProperty('recordModified');
    expect(newValue).toHaveProperty('doi', '10.0000/paste-test');
  });
});
