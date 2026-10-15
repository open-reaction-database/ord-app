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
import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactNS from 'react';
import { renderWithMantine } from '#testing/renderWithMantine.tsx';
import { KetcherDialog } from './KetcherDialog.tsx';
import type { StructureDialogProps } from './structure.types.ts';

// Ketcher's editor needs a WASM struct service and a canvas, which happy-dom lacks. The
// stub keeps the API the dialog relies on (onInit, setMolecule, the getters, the editor's
// change events, and the struct service), which a Ketcher upgrade could break, and hands
// each mount an instance of its own, as Ketcher does. Aromatizing answers with the
// notation it was asked for.
function createInstance() {
  const changeHandlers = new Set<() => void>();
  let blank = true;
  return {
    setMolecule: vi.fn((_structure: string) => Promise.resolve()),
    getMolfile: vi.fn(() => Promise.resolve('MOLFILE')),
    getKet: vi.fn(() => Promise.resolve('KET')),
    editor: {
      serverSettings: { 'smart-layout': true },
      struct: () => ({ isBlank: () => blank }),
      subscribe: (event: string, handler: () => void) => {
        if (event === 'change') {
          changeHandlers.add(handler);
        }
        return handler;
      },
      unsubscribe: (_event: string, handler: () => void) => {
        changeHandlers.delete(handler);
      },
    },
    structService: {
      aromatize: vi.fn(
        (data: { struct: string; output_format: string }, _options?: object) =>
          Promise.resolve({ struct: `aromatic ${data.output_format}` }),
      ),
    },
    /** Changes the canvas, as a drawing or an erasure does, and tells the subscribers. */
    change(drawn: boolean) {
      blank = !drawn;
      act(() => changeHandlers.forEach(handler => handler()));
    },
    listeners: () => changeHandlers.size,
  };
}

type Instance = ReturnType<typeof createInstance>;

const instances = vi.hoisted((): Array<Instance> => []);

function latest(): Instance {
  return instances[instances.length - 1];
}

// Ketcher takes a while to initialize; a test holds the editors that mount meanwhile here.
const initializing = vi.hoisted(() => ({
  held: false,
  pending: [] as Array<() => void>,
}));

// Reads a structure as setMolecule would; a test rejects it to make the structure unreadable.
const parseStruct = vi.hoisted(() =>
  vi.fn((_structure: string) => Promise.resolve({})),
);

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
  parseStruct,
}));

vi.mock('ketcher-react', async () => {
  const React = (await vi.importActual('react')) as typeof ReactNS;
  return {
    // Calls the host's onInit once per mount, as Ketcher does when it is ready, unless a
    // test holds it.
    Editor: (props: Readonly<{ onInit?: (instance: Instance) => void }>) => {
      React.useEffect(() => {
        const initialize = () => {
          const instance = createInstance();
          instances.push(instance);
          props.onInit?.(instance);
        };
        if (initializing.held) {
          initializing.pending.push(initialize);
        } else {
          initialize();
        }
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
    initializing.held = false;
    initializing.pending.length = 0;
  });

  it('loads the initial structure once Ketcher initializes', async () => {
    renderWithMantine(<KetcherDialog {...props()} />);
    await waitFor(() => expect(latest().setMolecule).toHaveBeenCalledWith('CCO'));
    expect(parseStruct).toHaveBeenCalledWith('CCO', latest().structService, latest());
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

  it('keeps Save off until the initial structure is on the canvas', async () => {
    initializing.held = true;
    let read = (): void => {};
    parseStruct.mockReturnValueOnce(
      new Promise(resolve => {
        read = () => resolve({});
      }),
    );
    const { getByRole } = renderWithMantine(<KetcherDialog {...props()} />);
    const save = getByRole('button', { name: 'Save' });
    expect(save).toBeDisabled();
    act(() => initializing.pending.forEach(initialize => initialize()));
    await waitFor(() => expect(parseStruct).toHaveBeenCalled());
    expect(save).toBeDisabled();
    let draw = (): void => {};
    latest().setMolecule.mockReturnValueOnce(
      new Promise(resolve => {
        draw = () => resolve();
      }),
    );
    await act(async () => read());
    expect(latest().setMolecule).toHaveBeenCalledWith('CCO');
    expect(save).toBeDisabled();
    await act(async () => draw());
    expect(save).toBeEnabled();
  });

  it('keeps Save off while a new initial structure loads', async () => {
    let read = (): void => {};
    const { getByRole, rerender } = renderWithMantine(<KetcherDialog {...props()} />);
    const save = getByRole('button', { name: 'Save' });
    await waitFor(() => expect(save).toBeEnabled());
    parseStruct.mockReturnValueOnce(
      new Promise(resolve => {
        read = () => resolve({});
      }),
    );
    rerender(<KetcherDialog {...props({ initial: 'CCN' })} />);
    expect(save).toBeDisabled();
    await act(async () => read());
    await waitFor(() => expect(save).toBeEnabled());
  });

  it('keeps Save off on reopening until the next Ketcher loads', async () => {
    const { getByRole, queryByTestId, rerender } = renderWithMantine(
      <KetcherDialog {...props()} />,
    );
    await waitFor(() => expect(getByRole('button', { name: 'Save' })).toBeEnabled());
    rerender(<KetcherDialog {...props({ opened: false })} />);
    await waitFor(() =>
      expect(queryByTestId('ketcher-editor')).not.toBeInTheDocument(),
    );
    initializing.held = true;
    rerender(<KetcherDialog {...props()} />);
    await waitFor(() => expect(queryByTestId('ketcher-editor')).toBeInTheDocument());
    expect(getByRole('button', { name: 'Save' })).toBeDisabled();
    act(() => initializing.pending.forEach(initialize => initialize()));
    await waitFor(() => expect(getByRole('button', { name: 'Save' })).toBeEnabled());
  });

  it('keeps Save off when an earlier structure finishes loading late', async () => {
    const reads = new Map<string, () => void>();
    parseStruct.mockImplementation(
      structure =>
        new Promise(resolve => {
          reads.set(structure, () => resolve({}));
        }),
    );
    const { getByRole, rerender } = renderWithMantine(<KetcherDialog {...props()} />);
    await waitFor(() => expect(reads.has('CCO')).toBe(true));
    let drawEarlier = (): void => {};
    latest().setMolecule.mockReturnValueOnce(
      new Promise(resolve => {
        drawEarlier = () => resolve();
      }),
    );
    await act(async () => reads.get('CCO')!());
    expect(latest().setMolecule).toHaveBeenCalledWith('CCO');
    rerender(<KetcherDialog {...props({ initial: 'CCN' })} />);
    await act(async () => drawEarlier());
    expect(getByRole('button', { name: 'Save' })).toBeDisabled();
    await act(async () => reads.get('CCN')!());
    await waitFor(() => expect(getByRole('button', { name: 'Save' })).toBeEnabled());
    expect(latest().setMolecule).toHaveBeenLastCalledWith('CCN');
  });

  async function save(format: StructureDialogProps['format']) {
    const onSave = vi.fn();
    const onClose = vi.fn();
    const { getByRole } = renderWithMantine(
      <KetcherDialog {...props({ format, onSave, onClose })} />,
    );
    await waitFor(() => expect(getByRole('button', { name: 'Save' })).toBeEnabled());
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
    await waitFor(() => expect(getByRole('button', { name: 'Save' })).toBeEnabled());
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
    await waitFor(() => expect(getByRole('button', { name: 'Save' })).toBeEnabled());
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
    await waitFor(() => expect(getByRole('button', { name: 'Save' })).toBeEnabled());
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

  it('keeps the buttons at their own width, and gives the host’s fields the rest', () => {
    const { getByRole, getByText } = renderWithMantine(
      <KetcherDialog {...props()}>
        <span>Details field</span>
      </KetcherDialog>,
    );
    const buttons = getByRole('button', { name: 'Cancel' }).parentElement!;
    expect(getByRole('button', { name: 'Save' }).parentElement).toBe(buttons);
    // A narrow modal, such as one on a phone, would otherwise squeeze the buttons' labels.
    expect(getComputedStyle(buttons).flexShrink).toBe('0');
    const fields = getByText('Details field').parentElement!;
    expect(getComputedStyle(fields).flexGrow).toBe('1');
    expect(getComputedStyle(fields).minWidth).toBe('0');
  });

  describe('with an initial structure Ketcher cannot read', () => {
    const REASON = 'SMILES loader: invalid character within atom description';

    beforeEach(() => {
      parseStruct.mockImplementation(structure =>
        structure === 'not a smiles'
          ? Promise.reject(new Error(REASON))
          : Promise.resolve({}),
      );
    });

    function renderUnreadable(overrides: Partial<StructureDialogProps> = {}) {
      return renderWithMantine(
        <KetcherDialog
          {...props({ initial: 'not a smiles', format: 'smiles', ...overrides })}
        />,
      );
    }

    it('says why, and keeps Save from writing the blank canvas over it', async () => {
      const onSave = vi.fn();
      const { getByRole } = renderUnreadable({ onSave });
      await waitFor(() =>
        expect(getByRole('alert')).toHaveTextContent(
          `The structure could not be loaded.${REASON}`,
        ),
      );
      expect(latest().setMolecule).not.toHaveBeenCalled();
      const save = getByRole('button', { name: 'Save' });
      expect(save).toBeDisabled();
      await userEvent.click(save);
      expect(latest().structService.aromatize).not.toHaveBeenCalled();
      expect(onSave).not.toHaveBeenCalled();
    });

    it('saves a drawing that replaces it', async () => {
      const onSave = vi.fn();
      const { getByRole, queryByRole } = renderUnreadable({ onSave });
      await waitFor(() => expect(getByRole('alert')).toBeInTheDocument());
      latest().change(true);
      expect(queryByRole('alert')).not.toBeInTheDocument();
      expect(latest().listeners()).toBe(0);
      await userEvent.click(getByRole('button', { name: 'Save' }));
      await waitFor(() =>
        expect(onSave).toHaveBeenCalledWith('aromatic chemical/x-daylight-smiles'),
      );
    });

    it('keeps Save off while a change leaves the canvas blank', async () => {
      const { getByRole } = renderUnreadable();
      await waitFor(() => expect(getByRole('alert')).toBeInTheDocument());
      latest().change(false);
      expect(getByRole('alert')).toBeInTheDocument();
      expect(getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('loads a readable structure given while open', async () => {
      const { getByRole, queryByRole, rerender } = renderUnreadable();
      await waitFor(() => expect(getByRole('alert')).toBeInTheDocument());
      rerender(<KetcherDialog {...props({ initial: 'CCN', format: 'smiles' })} />);
      await waitFor(() => expect(latest().setMolecule).toHaveBeenCalledWith('CCN'));
      expect(queryByRole('alert')).not.toBeInTheDocument();
      expect(getByRole('button', { name: 'Save' })).toBeEnabled();
    });

    it('forgets it once closed', async () => {
      const { getByRole, queryByRole, queryByTestId, rerender } = renderUnreadable();
      await waitFor(() => expect(getByRole('alert')).toBeInTheDocument());
      rerender(
        <KetcherDialog {...props({ initial: 'not a smiles', opened: false })} />,
      );
      await waitFor(() =>
        expect(queryByTestId('ketcher-editor')).not.toBeInTheDocument(),
      );
      initializing.held = true;
      rerender(<KetcherDialog {...props({ initial: 'CCN' })} />);
      await waitFor(() => expect(queryByTestId('ketcher-editor')).toBeInTheDocument());
      // The next Ketcher is still initializing, without the last one's failure over it.
      expect(queryByRole('alert')).not.toBeInTheDocument();
      act(() => initializing.pending.forEach(initialize => initialize()));
      await waitFor(() => expect(latest().setMolecule).toHaveBeenCalledWith('CCN'));
      expect(queryByRole('alert')).not.toBeInTheDocument();
      expect(getByRole('button', { name: 'Save' })).toBeEnabled();
    });
  });

  it.each([
    ['is read', true],
    ['cannot be read', false],
  ])('ignores an earlier structure that %s late', async (_outcome, readable) => {
    let readEarlier = (): void => {};
    parseStruct.mockReturnValueOnce(
      new Promise((resolve, reject) => {
        readEarlier = () => (readable ? resolve({}) : reject(new Error('unreadable')));
      }),
    );
    const { queryByRole, rerender } = renderWithMantine(<KetcherDialog {...props()} />);
    await waitFor(() =>
      expect(parseStruct).toHaveBeenCalledWith('CCO', latest().structService, latest()),
    );
    rerender(<KetcherDialog {...props({ initial: 'CCN' })} />);
    await waitFor(() => expect(latest().setMolecule).toHaveBeenCalledWith('CCN'));
    await act(async () => readEarlier());
    expect(latest().setMolecule).toHaveBeenCalledTimes(1);
    expect(queryByRole('alert')).not.toBeInTheDocument();
  });
});
