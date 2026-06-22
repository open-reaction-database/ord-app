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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { ReactionEntityForm } from './ReactionEntityForm.tsx';
import { reactionSidebarInfo } from 'features/reactions/ReactionEntities/sidebarInfo/sidebarInfo.models.ts';
import { ReactionNodeEntity } from 'store/entities/reactions/reactions.types.ts';

// The real form registry eagerly imports every node form, including the Ketcher/d3 structure
// editor (a CJS/ESM break under vitest). Stub the registry to an empty form — the field nodes
// aren't what's under test here; the paste-submit wiring is.
vi.mock('features/reactions/ReactionEntities', () => ({
  ReactionEntityBaseNode: () => null,
  reactionEntityToForm: new Proxy({}, { get: () => [] }),
}));

// Drive the paste flow through a stubbed clipboard read and capture what the form dispatches.
const pasteReactionPartMock = vi.fn();
vi.mock('./reactionEntityForm.utils.ts', async importActual => ({
  ...((await importActual()) as Record<string, unknown>),
  pasteReactionPart: (...args: Array<unknown>) => pasteReactionPartMock(...args),
}));

const addUpdateReactionFieldMock = vi.fn((_arg: unknown) => ({ type: 'test/noop' }));
vi.mock('store/entities/reactions/reactions.thunks.ts', async importActual => ({
  ...((await importActual()) as Record<string, unknown>),
  addUpdateReactionField: (arg: unknown) => addUpdateReactionFieldMock(arg),
}));

const provenanceSidebarInfo = reactionSidebarInfo.find(
  info => info.entityName === ReactionNodeEntity.Provenance,
)!;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ReactionEntityForm — Paste Chunk filtering', () => {
  it('submits the filtered chunk, dropping fields the sidebar excludes (e.g. recordModified)', async () => {
    // A clipboard chunk that includes recordModified — which the Provenance sidebar filters out
    // (it is edited in its own sidebar) — plus an ordinary field that must survive the paste.
    pasteReactionPartMock.mockResolvedValue([
      { doi: '10.0000/paste-test', recordModified: { time: { value: 'leaked' } } },
      'clipboard-text',
    ]);

    renderInReactionView(
      <ReactionEntityForm
        isHidden={false}
        reactionPathComponents={provenanceSidebarInfo.pathComponents}
        sidebarInfo={provenanceSidebarInfo}
        onFormClose={() => {}}
        onSetFormDirty={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Paste Chunk' }));
    fireEvent.click(screen.getByRole('button', { name: 'Paste' }));

    await waitFor(() => expect(addUpdateReactionFieldMock).toHaveBeenCalled());

    const { newValue } = addUpdateReactionFieldMock.mock.calls[0][0] as {
      newValue: Record<string, unknown>;
    };
    // The bug submitted the raw chunk, leaking recordModified into the merge; the fix submits filtered values.
    expect(newValue).not.toHaveProperty('recordModified');
    expect(newValue).toHaveProperty('doi', '10.0000/paste-test');
  });
});
