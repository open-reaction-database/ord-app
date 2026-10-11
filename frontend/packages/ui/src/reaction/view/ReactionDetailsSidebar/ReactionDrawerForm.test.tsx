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
import { fireEvent, waitFor } from '@testing-library/react';
import { create } from '@bufbuild/protobuf';
import {
  ReactionIdentifier_ReactionIdentifierType,
  ReactionSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { ordReactionToReaction } from '#reaction/model/reactions.converters.ts';
import {
  renderWithReaction,
  stubReactionActions,
} from '#testing/renderWithReaction.tsx';
import { ReactionDrawerForm } from './ReactionDrawerForm.tsx';

describe('ReactionDrawerForm', () => {
  it('renders the entity’s form outside the drawer', () => {
    const { getByRole, queryByRole } = renderWithReaction(
      <ReactionDrawerForm pathComponents={['notes']} />,
      { editable: true },
    );
    expect(getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(queryByRole('heading', { name: 'Notes' })).not.toBeInTheDocument();
  });

  it('shows the entity’s title above the form when asked', () => {
    const { getByRole } = renderWithReaction(
      <ReactionDrawerForm
        pathComponents={['notes']}
        showTitle
      />,
      { editable: true },
    );
    expect(getByRole('heading', { name: 'Notes' })).toBeInTheDocument();
  });

  it('saves the entity it shows after switching to another one', async () => {
    const reaction = ordReactionToReaction(
      create(ReactionSchema, {
        identifiers: [
          {
            type: ReactionIdentifier_ReactionIdentifierType.REACTION_SMILES,
            value: 'A>>B',
          },
          {
            type: ReactionIdentifier_ReactionIdentifierType.REACTION_SMILES,
            value: 'C>>D',
          },
        ],
      }),
    );
    const actions = stubReactionActions();
    const { getByRole, rerender } = renderWithReaction(
      <ReactionDrawerForm pathComponents={['identifiers', 0]} />,
      { reaction, actions },
    );
    rerender(<ReactionDrawerForm pathComponents={['identifiers', 1]} />);
    fireEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(actions.update).toHaveBeenCalled());
    const [pathComponents, newValue] = actions.update.mock.calls[0];
    expect(pathComponents).toEqual(['identifiers', 1]);
    expect(newValue).toMatchObject({ value: 'C>>D' });
  });

  it('offers Close and Save and Close only with an onClose to call', () => {
    const plain = renderWithReaction(
      <ReactionDrawerForm pathComponents={['notes']} />,
      {
        editable: true,
      },
    );
    expect(plain.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    expect(
      plain.queryByRole('button', { name: 'Save and Close' }),
    ).not.toBeInTheDocument();
    plain.unmount();
    const onClose = vi.fn();
    const closable = renderWithReaction(
      <ReactionDrawerForm
        pathComponents={['notes']}
        onClose={onClose}
      />,
      { editable: true },
    );
    fireEvent.click(closable.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(
      closable.getByRole('button', { name: 'Save and Close' }),
    ).toBeInTheDocument();
  });

  it('saves on Cmd+Enter when it has nowhere to close to', async () => {
    const actions = stubReactionActions();
    const { container } = renderWithReaction(
      <ReactionDrawerForm pathComponents={['notes']} />,
      { actions },
    );
    fireEvent.keyDown(container.querySelector('form') as HTMLFormElement, {
      key: 'Enter',
      metaKey: true,
    });
    await waitFor(() => expect(actions.update).toHaveBeenCalled());
    expect(actions.update.mock.calls[0][0]).toEqual(['notes']);
  });
});
