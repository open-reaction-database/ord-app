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
// aren't what's under test here; the save-and-close wiring is.
vi.mock('features/reactions/ReactionEntities', () => ({
  ReactionEntityBaseNode: () => null,
  reactionEntityToForm: new Proxy({}, { get: () => [] }),
}));

const addUpdateReactionFieldMock = vi.fn((_arg: unknown) => ({ type: 'test/noop' }));
vi.mock('store/entities/reactions/reactions.thunks.ts', async importActual => ({
  ...((await importActual()) as Record<string, unknown>),
  addUpdateReactionField: (arg: unknown) => addUpdateReactionFieldMock(arg),
}));

const provenanceSidebarInfo = reactionSidebarInfo.find(
  info => info.entityName === ReactionNodeEntity.Provenance,
)!;

const onFormClose = vi.fn();

function renderForm() {
  renderInReactionView(
    <ReactionEntityForm
      isHidden={false}
      reactionPathComponents={provenanceSidebarInfo.pathComponents}
      sidebarInfo={provenanceSidebarInfo}
      onFormClose={onFormClose}
      onSetFormDirty={() => {}}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ReactionEntityForm — Save and Close (#550)', () => {
  it('saves the form and closes the sidebar when clicked', async () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Save and Close' }));

    await waitFor(() => expect(addUpdateReactionFieldMock).toHaveBeenCalledTimes(1));
    expect(onFormClose).toHaveBeenCalledTimes(1);
  });

  it('saves and closes on Cmd/Ctrl+Enter', async () => {
    renderForm();

    fireEvent.keyDown(screen.getByRole('button', { name: 'Save and Close' }), {
      key: 'Enter',
      ctrlKey: true,
    });

    await waitFor(() => expect(addUpdateReactionFieldMock).toHaveBeenCalledTimes(1));
    expect(onFormClose).toHaveBeenCalledTimes(1);
  });
});
