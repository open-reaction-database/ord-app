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
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactNS from 'react';
import { renderWithMantine } from '#testing/renderWithMantine.tsx';
import { KetcherDialog } from './KetcherDialog.tsx';
import type { StructureDialogProps } from './structure.types.ts';

// Ketcher's editor needs a WASM struct service and a canvas, which happy-dom lacks. The
// stub keeps the API the dialog relies on (onInit, setMolecule, the getters, and the struct
// service), which a Ketcher upgrade could break, and hands each mount an instance of its
// own, as Ketcher does. Aromatizing answers with the notation it was asked for.
function createInstance() {
  return {
    setMolecule: vi.fn((_structure: string) => Promise.resolve()),
    getMolfile: vi.fn(() => Promise.resolve('MOLFILE')),
    getKet: vi.fn(() => Promise.resolve('KET')),
    editor: { serverSettings: { 'smart-layout': true } },
    structService: {
      aromatize: vi.fn(
        (data: { struct: string; output_format: string }, _options?: object) =>
          Promise.resolve({ struct: `aromatic ${data.output_format}` }),
      ),
    },
  };
}

type Instance = ReturnType<typeof createInstance>;

const instances = vi.hoisted((): Array<Instance> => []);

function latest(): Instance {
  return instances[instances.length - 1];
}

vi.mock('ketcher-standalone', () => ({
  StandaloneStructServiceProvider: class {},
}));

// Importing Ketcher's core asks for a canvas context, which happy-dom lacks; the dialog
// reads only these values from it.
vi.mock('ketcher-core', () => ({
  ChemicalMimeType: {
    DaylightSmiles: 'chemical/x-daylight-smiles',
    DaylightSmarts: 'chemical/x-daylight-smarts',
  },
}));

vi.mock('ketcher-react', async () => {
  const React = (await vi.importActual('react')) as typeof ReactNS;
  return {
    // Calls the host's onInit once per mount, as Ketcher does when it is ready.
    Editor: (props: Readonly<{ onInit?: (instance: Instance) => void }>) => {
      React.useEffect(() => {
        const instance = createInstance();
        instances.push(instance);
        props.onInit?.(instance);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- once per mount, as Ketcher does
      }, []);
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
  beforeEach(() => {
    instances.length = 0;
  });

  it('loads the initial structure once Ketcher initializes', async () => {
    renderWithMantine(<KetcherDialog {...props()} />);
    await waitFor(() => expect(latest().setMolecule).toHaveBeenCalledWith('CCO'));
  });

  it('loads the initial structure into each opening’s Ketcher, and only into it', async () => {
    const { rerender, queryByTestId } = renderWithMantine(
      <KetcherDialog {...props()} />,
    );
    const close = async () => {
      rerender(<KetcherDialog {...props({ opened: false })} />);
      await waitFor(() =>
        expect(queryByTestId('ketcher-editor')).not.toBeInTheDocument(),
      );
    };
    await waitFor(() => expect(instances[0].setMolecule).toHaveBeenCalledWith('CCO'));
    await close();
    rerender(<KetcherDialog {...props()} />);
    await waitFor(() => expect(instances[1].setMolecule).toHaveBeenCalledWith('CCO'));
    await close();
    rerender(<KetcherDialog {...props({ initial: 'CCN' })} />);
    await waitFor(() => expect(instances[2].setMolecule).toHaveBeenCalledWith('CCN'));
    // The modal unmounts Ketcher while closed, so an earlier instance is never used again.
    expect(instances[0].setMolecule).toHaveBeenCalledTimes(1);
    expect(instances[1].setMolecule).toHaveBeenCalledTimes(1);
  });

  it('loads a new initial structure while open', async () => {
    const { rerender } = renderWithMantine(<KetcherDialog {...props()} />);
    await waitFor(() => expect(latest().setMolecule).toHaveBeenCalledWith('CCO'));
    rerender(<KetcherDialog {...props({ initial: 'CCN' })} />);
    await waitFor(() => expect(latest().setMolecule).toHaveBeenLastCalledWith('CCN'));
  });

  async function save(format: StructureDialogProps['format']) {
    const onSave = vi.fn();
    const onClose = vi.fn();
    const { getByRole } = renderWithMantine(
      <KetcherDialog {...props({ format, onSave, onClose })} />,
    );
    await waitFor(() => expect(latest().setMolecule).toHaveBeenCalled());
    await userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    return onSave;
  }

  it('saves the drawing as a molfile and closes', async () => {
    const onSave = await save('molfile');
    expect(onSave).toHaveBeenCalledWith('MOLFILE');
    expect(latest().structService.aromatize).not.toHaveBeenCalled();
  });

  it.each([
    ['smiles', 'chemical/x-daylight-smiles'],
    ['smarts', 'chemical/x-daylight-smarts'],
  ] as const)('saves the drawing as aromatized %s and closes', async (format, mime) => {
    const onSave = await save(format);
    // The editor's own settings, with the model that aromatizes pyridones and purines.
    expect(latest().structService.aromatize).toHaveBeenCalledWith(
      { struct: 'KET', output_format: mime },
      { 'smart-layout': true, 'aromaticity-model': 'generic' },
    );
    expect(onSave).toHaveBeenCalledWith(`aromatic ${mime}`);
  });

  it('says why a drawing could not be saved, and saves it on a later try', async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    const { getByRole, queryByRole } = renderWithMantine(
      <KetcherDialog {...props({ format: 'smiles', onSave, onClose })} />,
    );
    await waitFor(() => expect(latest().setMolecule).toHaveBeenCalled());
    latest().structService.aromatize.mockRejectedValueOnce(
      new Error('SMILES saver: atom list can be used only with smarts_mode'),
    );
    await userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(getByRole('alert')).toHaveTextContent(
        'The drawing could not be saved: SMILES saver: atom list can be used only with smarts_mode',
      ),
    );
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith('aromatic chemical/x-daylight-smiles'),
    );
    await waitFor(() => expect(queryByRole('alert')).not.toBeInTheDocument());
  });

  it('puts a failed save aside when the canvas is clicked', async () => {
    const { getByRole, getByTestId, queryByRole } = renderWithMantine(
      <KetcherDialog {...props({ format: 'smiles' })} />,
    );
    await waitFor(() => expect(latest().setMolecule).toHaveBeenCalled());
    latest().structService.aromatize.mockRejectedValueOnce(new Error('unreadable'));
    await userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(getByRole('alert')).toBeInTheDocument());
    await userEvent.click(getByTestId('ketcher-editor'));
    await waitFor(() => expect(queryByRole('alert')).not.toBeInTheDocument());
  });

  it('forgets a failed save once closed', async () => {
    const { getByRole, queryByRole, queryByTestId, rerender } = renderWithMantine(
      <KetcherDialog {...props({ format: 'smiles' })} />,
    );
    await waitFor(() => expect(latest().setMolecule).toHaveBeenCalled());
    latest().structService.aromatize.mockRejectedValueOnce(new Error('unreadable'));
    await userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(getByRole('alert')).toBeInTheDocument());
    rerender(<KetcherDialog {...props({ format: 'smiles', opened: false })} />);
    await waitFor(() =>
      expect(queryByTestId('ketcher-editor')).not.toBeInTheDocument(),
    );
    rerender(<KetcherDialog {...props({ format: 'smiles' })} />);
    await waitFor(() => expect(instances).toHaveLength(2));
    await waitFor(() => expect(latest().setMolecule).toHaveBeenCalled());
    await waitFor(() => expect(queryByRole('alert')).not.toBeInTheDocument());
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
