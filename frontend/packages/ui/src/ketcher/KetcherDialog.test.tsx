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
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactNS from 'react';
import { renderWithMantine } from '#testing/renderWithMantine.tsx';
import { KetcherDialog } from './KetcherDialog.tsx';
import type { StructureDialogProps } from './structure.types.ts';

// Ketcher's editor needs a WASM struct service and a canvas, which happy-dom lacks. The
// stubs keep the API the dialog relies on (onInit, setMolecule, and the getters), which a
// Ketcher upgrade could break.
const ketcher = {
  setMolecule: vi.fn((_structure: string) => Promise.resolve()),
  getMolfile: vi.fn(() => Promise.resolve('MOLFILE')),
  getSmiles: vi.fn(() => Promise.resolve('SMILES')),
  getSmarts: vi.fn(() => Promise.resolve('SMARTS')),
};

vi.mock('ketcher-standalone', () => ({
  StandaloneStructServiceProvider: class {},
}));

vi.mock('ketcher-react', async () => {
  const React = (await vi.importActual('react')) as typeof ReactNS;
  return {
    // Calls the host's onInit once on mount, as Ketcher does when it is ready.
    Editor: (props: Readonly<{ onInit?: (instance: typeof ketcher) => void }>) => {
      React.useEffect(() => {
        props.onInit?.(ketcher);
      }, [props]);
      return React.createElement('div', { 'data-testid': 'ketcher-editor' });
    },
  };
});

vi.mock('ketcher-react/dist/index.css', () => ({}));

function props(overrides: Partial<StructureDialogProps> = {}): StructureDialogProps {
  return {
    opened: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    initial: 'CCO',
    format: 'molfile',
    ...overrides,
  };
}

describe('KetcherDialog', () => {
  it('loads the initial structure once Ketcher initializes', async () => {
    renderWithMantine(<KetcherDialog {...props()} />);
    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenCalledWith('CCO'));
  });

  it('loads the initial structure again when reopened, whether or not it changed', async () => {
    const { rerender } = renderWithMantine(<KetcherDialog {...props()} />);
    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenCalledWith('CCO'));
    rerender(<KetcherDialog {...props({ opened: false })} />);
    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenLastCalledWith(''));
    rerender(<KetcherDialog {...props()} />);
    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenLastCalledWith('CCO'));
    rerender(<KetcherDialog {...props({ opened: false })} />);
    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenLastCalledWith(''));
    rerender(<KetcherDialog {...props({ initial: 'CCN' })} />);
    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenLastCalledWith('CCN'));
  });

  it('clears the canvas when closed', async () => {
    const { rerender } = renderWithMantine(<KetcherDialog {...props()} />);
    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenCalledWith('CCO'));
    rerender(<KetcherDialog {...props({ opened: false })} />);
    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenLastCalledWith(''));
  });

  it.each([
    ['molfile', 'MOLFILE', ketcher.getMolfile],
    ['smiles', 'SMILES', ketcher.getSmiles],
    ['smarts', 'SMARTS', ketcher.getSmarts],
  ] as const)('saves the drawing as %s and closes', async (format, saved, getter) => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    const { getByRole } = renderWithMantine(
      <KetcherDialog {...props({ format, onSave, onClose })} />,
    );
    await waitFor(() => expect(ketcher.setMolecule).toHaveBeenCalled());
    await userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(getter).toHaveBeenCalled();
      expect(onSave).toHaveBeenCalledWith(saved);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows the host’s fields beside the buttons', () => {
    const { getByText } = renderWithMantine(
      <KetcherDialog {...props()}>
        <span>Details field</span>
      </KetcherDialog>,
    );
    expect(getByText('Details field')).toBeInTheDocument();
  });
});
