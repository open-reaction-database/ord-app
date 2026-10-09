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
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import type { ReactionCompoundIdentifier } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';
import { ComponentsKetcherEditor } from './ComponentsKetcherEditor.tsx';

// The real Ketcher editor pulls in a WASM struct-service and a canvas renderer that cannot run
// under happy-dom. We stub `ketcher-react`/`ketcher-standalone` and assert the integration
// contract our component relies on — the exact API surface (`onInit`, `setMolecule`,
// `getMolfile`, `getSmiles`) that a Ketcher major upgrade could silently break.
const ketcher = {
  setMolecule: vi.fn((_molecule: string) => undefined),
  getMolfile: vi.fn(() => Promise.resolve('MOLFILE')),
  getSmiles: vi.fn((_isExtended?: boolean) => Promise.resolve('CXSMILES')),
};

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

// Notifications render into a Mantine portal that `renderWithMantine` does not mount,
// so assert on the call rather than on the DOM.
vi.mock('common/utils/showNotification.tsx', () => ({
  showNotification: vi.fn(),
}));

const identifier: ReactionCompoundIdentifier = {
  id: 'molblock-id',
  type: 'MOLBLOCK',
  value: 'CCO',
  details: 'ethanol',
};

const cxSmilesIdentifier: ReactionCompoundIdentifier = {
  id: 'cxsmiles-id',
  type: 'CXSMILES',
  value: 'C[C@H](N)C(=O)O |&1:1|',
  details: 'alanine',
};

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
        identifier={cxSmilesIdentifier}
      />,
    );

    await waitFor(() =>
      expect(ketcher.setMolecule).toHaveBeenCalledWith('C[C@H](N)C(=O)O |&1:1|'),
    );
  });

  it('saves a CXSMILES identifier back as CXSMILES rather than a molblock', async () => {
    const onSave = vi.fn();
    const { getByRole } = renderWithMantine(
      <ComponentsKetcherEditor
        opened
        onClose={vi.fn()}
        onSave={onSave}
        identifier={cxSmilesIdentifier}
      />,
    );

    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenCalled());
    await userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(ketcher.getSmiles).toHaveBeenCalledWith(true);
      expect(ketcher.getMolfile).not.toHaveBeenCalled();
      expect(onSave).toHaveBeenCalledWith({
        type: 'CXSMILES',
        value: 'CXSMILES',
        details: 'alanine',
      });
    });
  });

  it('defaults a drawing started from scratch to a molblock', async () => {
    const onSave = vi.fn();
    const { getByRole } = renderWithMantine(
      <ComponentsKetcherEditor
        opened
        onClose={vi.fn()}
        onSave={onSave}
        identifier={null}
      />,
    );

    await userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'MOLBLOCK', value: 'MOLFILE' }),
      ),
    );
  });

  it('surfaces a serialization failure instead of rejecting unhandled', async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    // Ketcher throws this when the canvas holds a reaction arrow.
    ketcher.getMolfile.mockRejectedValueOnce(
      new Error('The structure cannot be saved as *.MOL due to reaction arrows.'),
    );
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

    await waitFor(() =>
      expect(showNotification).toHaveBeenCalledWith({
        variant: NotificationVariant.ERROR,
        message: 'The structure cannot be saved as *.MOL due to reaction arrows.',
      }),
    );
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('catches a synchronous serialization throw', async () => {
    const onSave = vi.fn();
    // Unlike `getMolfile`, `getSmiles` throws rather than rejecting.
    ketcher.getSmiles.mockImplementationOnce(() => {
      throw new Error('SMILES format is not available in macro mode');
    });
    const { getByRole } = renderWithMantine(
      <ComponentsKetcherEditor
        opened
        onClose={vi.fn()}
        onSave={onSave}
        identifier={cxSmilesIdentifier}
      />,
    );

    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenCalled());
    await userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(showNotification).toHaveBeenCalledWith({
        variant: NotificationVariant.ERROR,
        message: 'SMILES format is not available in macro mode',
      }),
    );
    expect(onSave).not.toHaveBeenCalled();
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
});
