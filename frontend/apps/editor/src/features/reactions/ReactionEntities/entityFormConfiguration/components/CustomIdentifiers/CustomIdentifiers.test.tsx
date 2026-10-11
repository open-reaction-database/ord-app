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
import { describe, it, expect } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import type { MoleculeEditorProps } from '@open-reaction-database/ui/reaction';
import type { AppReaction } from '@open-reaction-database/ui/reaction/model';
import {
  renderWithReaction,
  emptyReactionData,
} from '@open-reaction-database/ui/testing';
import { CustomIdentifiers } from './CustomIdentifiers.tsx';

const reaction = {
  ...emptyReactionData(),
  inputs: {
    in1: { id: 'in1', name: 'in1', components: [{ id: 'c1', identifiers: [] }] },
  },
} as unknown as AppReaction;

const componentPath = ['inputs', 'in1', 'components', 0];

function FakeMoleculeEditor({ opened }: Readonly<MoleculeEditorProps>) {
  return opened ? <p>editor open</p> : null;
}

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
      slots: { MoleculeEditor: FakeMoleculeEditor },
    });
    expect(queryByText('editor open')).not.toBeInTheDocument();
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
});
