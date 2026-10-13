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
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactNS from 'react';
import type { StructureDialogProps } from '@open-reaction-database/ui/ketcher';
import type { MoleculeIdentifier } from '@open-reaction-database/ui/reaction';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { ComponentsKetcherEditor } from './ComponentsKetcherEditor.tsx';

// The dialog itself is tested in the shared package; this stub shows what the editor
// passes it and saves the format's name in capitals, "MOLFILE" for a molfile.
vi.mock('@open-reaction-database/ui/ketcher', async () => {
  const React = (await vi.importActual('react')) as typeof ReactNS;
  return {
    StructureDialog: (props: Readonly<StructureDialogProps>) =>
      props.opened
        ? React.createElement(
            'div',
            {
              'data-testid': 'structure-dialog',
              'data-initial': props.initial,
              'data-format': props.format,
            },
            props.children,
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: () => props.onSave(props.format.toUpperCase()),
              },
              'Save',
            ),
          )
        : null,
  };
});

const identifier: MoleculeIdentifier = {
  type: 'MOLBLOCK',
  value: 'CCO',
  details: 'ethanol',
};

describe('ComponentsKetcherEditor', () => {
  it('opens the identifier’s structure and asks for a molfile', () => {
    const { getByTestId } = renderWithMantine(
      <ComponentsKetcherEditor
        opened
        onClose={vi.fn()}
        onSave={vi.fn()}
        identifier={identifier}
      />,
    );
    const dialog = getByTestId('structure-dialog');
    expect(dialog).toHaveAttribute('data-initial', 'CCO');
    expect(dialog).toHaveAttribute('data-format', 'molfile');
  });

  it('saves the drawing with the Details field’s value', async () => {
    const onSave = vi.fn();
    const { getByLabelText, getByRole } = renderWithMantine(
      <ComponentsKetcherEditor
        opened
        onClose={vi.fn()}
        onSave={onSave}
        identifier={identifier}
      />,
    );
    const details = getByLabelText('Details');
    await userEvent.clear(details);
    await userEvent.type(details, 'drawn again');
    await userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        type: 'MOLBLOCK',
        value: 'MOLFILE',
        details: 'drawn again',
      }),
    );
  });

  it('opens a CXSMILES identifier and saves the drawing back as CXSMILES', async () => {
    const onSave = vi.fn();
    const { getByTestId, getByRole } = renderWithMantine(
      <ComponentsKetcherEditor
        opened
        onClose={vi.fn()}
        onSave={onSave}
        identifier={{
          type: 'CXSMILES',
          value: 'C[C@H](N)C(=O)O |&1:1|',
          details: 'racemic alanine',
        }}
      />,
    );
    const dialog = getByTestId('structure-dialog');
    expect(dialog).toHaveAttribute('data-initial', 'C[C@H](N)C(=O)O |&1:1|');
    expect(dialog).toHaveAttribute('data-format', 'cxsmiles');
    await userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        type: 'CXSMILES',
        value: 'CXSMILES',
        details: 'racemic alanine',
      }),
    );
  });

  it('starts a new drawing blank, with the default details, and saves a molblock', async () => {
    const onSave = vi.fn();
    const { getByTestId, getByLabelText, getByRole } = renderWithMantine(
      <ComponentsKetcherEditor
        opened
        onClose={vi.fn()}
        onSave={onSave}
        identifier={null}
      />,
    );
    expect(getByTestId('structure-dialog')).toHaveAttribute('data-initial', '');
    expect(getByTestId('structure-dialog')).toHaveAttribute('data-format', 'molfile');
    expect(getByLabelText('Details')).toHaveValue('Drawn with Ketcher');
    await userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'MOLBLOCK', value: 'MOLFILE' }),
      ),
    );
  });
});
