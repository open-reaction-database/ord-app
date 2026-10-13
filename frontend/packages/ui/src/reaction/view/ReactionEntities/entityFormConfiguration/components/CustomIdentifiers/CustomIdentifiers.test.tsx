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
import { describe, it, expect, vi } from 'vitest';
import type { ReactionViewDeleteButtonsProps } from '#reaction/provider/reactionViewDeleteButtons.types.ts';
import { fireEvent, waitFor } from '@testing-library/react';
import type { MoleculeEditorProps } from '#reaction/provider/reactionProvider.types.ts';
import type { AppReaction } from '#reaction/model/reactions.types.ts';
import {
  renderWithReaction,
  stubReactionActions,
} from '#testing/renderWithReaction.tsx';
import { emptyReactionData } from '#testing/emptyReactionData.ts';
import { CustomIdentifiers } from './CustomIdentifiers.tsx';

const RACEMIC_ALANINE = 'C[C@H](N)C(=O)O |&1:1|';

const reaction = {
  ...emptyReactionData(),
  inputs: {
    in1: { id: 'in1', name: 'in1', components: [{ id: 'c1', identifiers: [] }] },
  },
} as unknown as AppReaction;

const componentPath = ['inputs', 'in1', 'components', 0];

vi.mock('#reaction/previews/renderPreviews.ts', () => ({
  renderPreviews: () => new Promise(() => undefined),
}));

const withMolblock = {
  ...emptyReactionData(),
  inputs: {
    in1: {
      id: 'in1',
      name: 'in1',
      components: [
        {
          id: 'c1',
          identifiers: [],
          molBlockIdentifiers: [{ id: 'm1', value: 'MOL', details: 'drawn' }],
        },
      ],
    },
  },
} as unknown as AppReaction;

const withCxsmiles = {
  ...emptyReactionData(),
  inputs: {
    in1: {
      id: 'in1',
      name: 'in1',
      components: [
        {
          id: 'c1',
          identifiers: [],
          molBlockIdentifiers: [
            { id: 'x1', type: 'CXSMILES', value: RACEMIC_ALANINE, details: 'racemate' },
          ],
        },
      ],
    },
  },
} as unknown as AppReaction;

function EditButton({ onEdit }: Readonly<ReactionViewDeleteButtonsProps>) {
  return onEdit ? (
    <button
      type="button"
      onClick={onEdit}
    >
      Edit
    </button>
  ) : null;
}

function FakeMoleculeEditor({ opened }: Readonly<MoleculeEditorProps>) {
  return opened ? <p>editor open</p> : null;
}

const fakeMoleculeEditor = { name: 'Fake Draw', Editor: FakeMoleculeEditor };

/** An editor that saves the structure it opened in its own type, a new one as CXSMILES. */
function SavingMoleculeEditor({
  opened,
  identifier,
  onSave,
}: Readonly<MoleculeEditorProps>) {
  return opened ? (
    <button
      type="button"
      onClick={() =>
        onSave({
          type: identifier?.type ?? 'CXSMILES',
          value: identifier ? 'REDRAWN' : RACEMIC_ALANINE,
          details: 'drawn',
        })
      }
    >
      Save drawing
    </button>
  ) : null;
}

const savingMoleculeEditor = { name: 'Fake Draw', Editor: SavingMoleculeEditor };

describe('CustomIdentifiers', () => {
  it('opens the name lookup from Add Identifier and closes it on Cancel', async () => {
    const { getByText, getByRole, queryByLabelText, findByLabelText } =
      renderWithReaction(<CustomIdentifiers />, {
        editable: true,
        reaction,
        pathComponents: ['inputs', 'in1', 'components', 0],
      });
    expect(queryByLabelText('Compound name')).not.toBeInTheDocument();
    fireEvent.click(getByText('Add Identifier'));
    expect(await findByLabelText('Compound name')).toBeInTheDocument();
    fireEvent.click(getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(queryByLabelText('Compound name')).not.toBeInTheDocument(),
    );
  });

  it('opens the host’s molecule editor from Add Molblock Identifier', () => {
    const { getByText, queryByText } = renderWithReaction(<CustomIdentifiers />, {
      editable: true,
      reaction,
      pathComponents: componentPath,
      slots: { MoleculeEditor: fakeMoleculeEditor },
    });
    expect(queryByText('editor open')).not.toBeInTheDocument();
    expect(getByText('Via Fake Draw')).toBeInTheDocument();
    fireEvent.click(getByText('Add Molblock Identifier'));
    expect(getByText('editor open')).toBeInTheDocument();
  });

  it('offers no molblock drawing without a molecule editor', () => {
    const { getByText, queryByText } = renderWithReaction(<CustomIdentifiers />, {
      editable: true,
      reaction,
      pathComponents: componentPath,
    });
    expect(getByText('Add Identifier')).toBeInTheDocument();
    expect(queryByText('Add Molblock Identifier')).not.toBeInTheDocument();
  });

  it('offers Edit on a molblock only with a molecule editor', () => {
    const options = {
      editable: true,
      reaction: withMolblock,
      pathComponents: componentPath,
    };
    const plain = renderWithReaction(<CustomIdentifiers />, {
      ...options,
      slots: { ViewDeleteButtons: EditButton },
    });
    expect(plain.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(
      plain.getByRole('button', { name: 'Remove Identifier' }),
    ).toBeInTheDocument();
    plain.unmount();
    const withEditor = renderWithReaction(<CustomIdentifiers />, {
      ...options,
      slots: { ViewDeleteButtons: EditButton, MoleculeEditor: fakeMoleculeEditor },
    });
    expect(withEditor.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });
  it('creates a drawn structure as the type the editor saved it in', () => {
    const actions = stubReactionActions();
    const { getByText, getByRole } = renderWithReaction(<CustomIdentifiers />, {
      actions,
      reaction,
      pathComponents: componentPath,
      slots: { MoleculeEditor: savingMoleculeEditor },
    });
    fireEvent.click(getByText('Add Molblock Identifier'));
    fireEvent.click(getByRole('button', { name: 'Save drawing' }));
    expect(actions.update).toHaveBeenCalledWith(
      [...componentPath, 'molBlockIdentifiers', 0],
      expect.objectContaining({
        type: 'CXSMILES',
        value: RACEMIC_ALANINE,
        details: 'drawn',
      }),
    );
  });

  it('keeps an edited CXSMILES identifier a CXSMILES', () => {
    const actions = stubReactionActions();
    const { getByRole } = renderWithReaction(<CustomIdentifiers />, {
      actions,
      reaction: withCxsmiles,
      pathComponents: componentPath,
      slots: { ViewDeleteButtons: EditButton, MoleculeEditor: savingMoleculeEditor },
    });
    fireEvent.click(getByRole('button', { name: 'Edit' }));
    fireEvent.click(getByRole('button', { name: 'Save drawing' }));
    expect(actions.update).toHaveBeenCalledWith(
      [...componentPath, 'molBlockIdentifiers', 0],
      expect.objectContaining({ id: 'x1', type: 'CXSMILES', value: 'REDRAWN' }),
    );
  });

  it('lists a CXSMILES identifier as a structure, labeled with its type', () => {
    const { getByText } = renderWithReaction(<CustomIdentifiers />, {
      reaction: withCxsmiles,
      pathComponents: componentPath,
    });
    expect(getByText('Structure Identifiers')).toBeInTheDocument();
    expect(getByText('CXSMILES')).toBeInTheDocument();
  });
});
