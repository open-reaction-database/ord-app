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
import {
  NotificationVariant,
  showNotification,
} from '@open-reaction-database/ui/display';
import type { MoleculeIdentifier } from '@open-reaction-database/ui/reaction';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { ComponentsKetcherEditor } from './ComponentsKetcherEditor.tsx';

// The real Ketcher editor pulls in a WASM struct-service and a canvas renderer that cannot run
// under happy-dom. We stub `ketcher-react`/`ketcher-standalone` and assert the integration
// contract our component relies on — the exact API surface (`onInit`, `setMolecule`,
// `getMolfile`, `getSmiles`, `containsReaction`) that a Ketcher major upgrade could
// silently break.
const ketcher = {
  setMolecule: vi.fn((_molecule: string) => undefined),
  getMolfile: vi.fn(() => Promise.resolve('MOLFILE')),
  getSmiles: vi.fn((_isExtended?: boolean) => Promise.resolve('CXSMILES')),
  containsReaction: vi.fn(() => false),
};

// Notifications render into a Mantine portal that `renderWithMantine` does not mount, so
// assert on the call rather than on the DOM.
vi.mock('@open-reaction-database/ui/display', async importActual => ({
  ...((await importActual()) as Record<string, unknown>),
  showNotification: vi.fn(),
}));

vi.mock('ketcher-standalone', () => ({
  StandaloneStructServiceProvider: class {},
}));

vi.mock('ketcher-react', async () => {
  const React = (await vi.importActual('react')) as typeof ReactNS;
  return {
    // Drive the host's `onInit` once on mount, mimicking Ketcher signalling readiness.
    Editor: (props: Readonly<{ onInit?: (instance: typeof ketcher) => void }>) => {
      React.useEffect(() => {
        props.onInit?.(ketcher);
      }, [props]);
      return React.createElement('div', { 'data-testid': 'ketcher-editor' });
    },
  };
});

vi.mock('ketcher-react/dist/index.css', () => ({}));

const identifier: MoleculeIdentifier = {
  type: 'MOLBLOCK',
  value: 'CCO',
  details: 'ethanol',
};

const cxsmilesIdentifier: MoleculeIdentifier = {
  type: 'CXSMILES',
  value: 'C[C@H](N)C(=O)O |&1:1|',
  details: 'racemic alanine',
};

async function openAndSave(value: MoleculeIdentifier | null) {
  const onSave = vi.fn();
  const onClose = vi.fn();
  const { getByRole } = renderWithMantine(
    <ComponentsKetcherEditor
      opened
      onClose={onClose}
      onSave={onSave}
      identifier={value}
    />,
  );
  if (value) {
    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenCalled());
  }
  await userEvent.click(getByRole('button', { name: 'Save' }));
  return { onSave, onClose };
}

describe('ComponentsKetcherEditor', () => {
  it('loads the identifier structure into Ketcher once the editor initializes', async () => {
    renderWithMantine(
      <ComponentsKetcherEditor
        opened
        onClose={vi.fn()}
        onSave={vi.fn()}
        identifier={identifier}
      />,
    );

    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenCalledWith('CCO'));
  });

  it('serializes the drawing via getMolfile and reports it through onSave on save', async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    const { getByRole } = renderWithMantine(
      <ComponentsKetcherEditor
        opened
        onClose={onClose}
        onSave={onSave}
        identifier={identifier}
      />,
    );

    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenCalled());
    await userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(ketcher.getMolfile).toHaveBeenCalled();
      expect(onSave).toHaveBeenCalledWith({
        type: 'MOLBLOCK',
        value: 'MOLFILE',
        details: 'ethanol',
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('loads a CXSMILES identifier onto the canvas', async () => {
    renderWithMantine(
      <ComponentsKetcherEditor
        opened
        onClose={vi.fn()}
        onSave={vi.fn()}
        identifier={cxsmilesIdentifier}
      />,
    );

    await waitFor(() =>
      expect(ketcher.setMolecule).toHaveBeenCalledWith('C[C@H](N)C(=O)O |&1:1|'),
    );
  });

  it('saves a CXSMILES identifier back as CXSMILES rather than a molblock', async () => {
    const { onSave, onClose } = await openAndSave(cxsmilesIdentifier);

    await waitFor(() => {
      expect(ketcher.getSmiles).toHaveBeenCalledWith(true);
      expect(onSave).toHaveBeenCalledWith({
        type: 'CXSMILES',
        value: 'CXSMILES',
        details: 'racemic alanine',
      });
      expect(onClose).toHaveBeenCalled();
    });
    expect(ketcher.getMolfile).not.toHaveBeenCalled();
  });

  it('saves a new drawing as a molblock', async () => {
    const { onSave } = await openAndSave(null);

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'MOLBLOCK', value: 'MOLFILE' }),
      ),
    );
    expect(ketcher.getSmiles).not.toHaveBeenCalled();
  });

  it('reports a molblock Ketcher cannot write and keeps the editor open', async () => {
    // Ketcher rejects this way when the canvas holds a reaction arrow.
    ketcher.getMolfile.mockRejectedValueOnce(
      new Error('The structure cannot be saved as *.MOL due to reaction arrows.'),
    );
    const { onSave, onClose } = await openAndSave(identifier);

    await waitFor(() =>
      expect(showNotification).toHaveBeenCalledWith({
        variant: NotificationVariant.ERROR,
        message: 'The structure cannot be saved as *.MOL due to reaction arrows.',
      }),
    );
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('reports a CXSMILES Ketcher throws on rather than rejects', async () => {
    // Unlike `getMolfile`, `getSmiles` throws synchronously.
    ketcher.getSmiles.mockImplementationOnce(() => {
      throw new Error('SMILES format is not available in macro mode');
    });
    const { onSave } = await openAndSave(cxsmilesIdentifier);

    await waitFor(() =>
      expect(showNotification).toHaveBeenCalledWith({
        variant: NotificationVariant.ERROR,
        message: 'SMILES format is not available in macro mode',
      }),
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it('refuses to save a reaction arrow into a CXSMILES identifier', async () => {
    // getSmiles would write the reaction as reaction SMILES into a compound identifier.
    ketcher.containsReaction.mockReturnValueOnce(true);
    const { onSave, onClose } = await openAndSave(cxsmilesIdentifier);

    await waitFor(() =>
      expect(showNotification).toHaveBeenCalledWith({
        variant: NotificationVariant.ERROR,
        message: 'The structure cannot be saved as CXSMILES due to reaction arrows.',
      }),
    );
    expect(ketcher.getSmiles).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('clears the canvas when the editor is closed', async () => {
    const { rerender } = renderWithMantine(
      <ComponentsKetcherEditor
        opened
        onClose={vi.fn()}
        onSave={vi.fn()}
        identifier={identifier}
      />,
    );

    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenCalledWith('CCO'));

    rerender(
      <ComponentsKetcherEditor
        opened={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        identifier={identifier}
      />,
    );

    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenCalledWith(''));
  });

  it('refuses to save over a CXSMILES whose coordinate bonds Ketcher cannot read', async () => {
    // Ketcher reads |C:...| bonds as single bonds, so cisplatin would come back with NH2.
    const { onSave, onClose } = await openAndSave({
      type: 'CXSMILES',
      value: '[NH3][Pt]([NH3])([Cl])[Cl] |C:0.0,2.1|',
      details: 'cisplatin',
    });

    await waitFor(() =>
      expect(showNotification).toHaveBeenCalledWith({
        variant: NotificationVariant.ERROR,
        message:
          'Ketcher cannot read the coordinate bonds in this CXSMILES, so saving it would change the structure.',
      }),
    );
    expect(ketcher.getSmiles).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('refuses to save over a CXSMILES whose multicenter attachments Ketcher cannot read', async () => {
    // Ketcher drops the m: field, cutting the haptic bond to the ring.
    const { onSave } = await openAndSave({
      type: 'CXSMILES',
      value: 'c1ccccc1.[Fe].* |m:7:0.1.2.3.4.5|',
      details: 'haptic',
    });

    await waitFor(() =>
      expect(showNotification).toHaveBeenCalledWith({
        variant: NotificationVariant.ERROR,
        message:
          'Ketcher cannot read the multicenter attachments in this CXSMILES, so saving it would change the structure.',
      }),
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves a CXSMILES whose extension has no coordinate bonds', async () => {
    // "C:" inside an atom label is not the coordinate-bond field.
    const { onSave } = await openAndSave({
      type: 'CXSMILES',
      value: 'CC(N)C(=O)O |$a,C:1;;;;;$|',
      details: 'labeled',
    });

    await waitFor(() => expect(onSave).toHaveBeenCalled());
  });
});
