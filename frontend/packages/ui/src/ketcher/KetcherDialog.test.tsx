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
import { NotificationVariant } from '#display/types/notification.ts';
import { showNotification } from '#display/utils/showNotification.tsx';
import { renderWithMantine } from '#testing/renderWithMantine.tsx';
import { KetcherDialog } from './KetcherDialog.tsx';
import type { StructureDialogProps } from './structure.types.ts';

// Notifications render into a portal renderWithMantine does not mount.
vi.mock('#display/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));

// Ketcher's editor needs a WASM struct service and a canvas, which happy-dom lacks. The
// stub keeps the API the dialog relies on (onInit, setMolecule, the getters, and
// containsReaction), which a Ketcher upgrade could break, and hands each mount an instance
// of its own, as Ketcher does.
function createInstance() {
  return {
    setMolecule: vi.fn((_structure: string) => Promise.resolve()),
    getMolfile: vi.fn(() => Promise.resolve('MOLFILE')),
    getSmiles: vi.fn((_isExtended?: boolean) => Promise.resolve('SMILES')),
    getSmarts: vi.fn(() => Promise.resolve('SMARTS')),
    containsReaction: vi.fn(() => false),
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

  it.each([
    ['molfile', 'MOLFILE', 'getMolfile'],
    ['smiles', 'SMILES', 'getSmiles'],
    ['smarts', 'SMARTS', 'getSmarts'],
  ] as const)('saves the drawing as %s and closes', async (format, saved, getter) => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    const { getByRole } = renderWithMantine(
      <KetcherDialog {...props({ format, onSave, onClose })} />,
    );
    await waitFor(() => expect(latest().setMolecule).toHaveBeenCalled());
    await userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(latest()[getter]).toHaveBeenCalled();
      expect(onSave).toHaveBeenCalledWith(saved);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('saves the drawing as CXSMILES through extended SMILES', async () => {
    const onSave = vi.fn();
    const { getByRole } = renderWithMantine(
      <KetcherDialog {...props({ format: 'cxsmiles', onSave })} />,
    );
    await waitFor(() => expect(latest().setMolecule).toHaveBeenCalled());
    await userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith('SMILES'));
    expect(latest().getSmiles).toHaveBeenCalledWith(true);
  });

  /**
   * Opens the dialog, readies Ketcher with `prepare`, clicks Save, and expects `message`
   * reported with nothing saved and the dialog left open.
   */
  async function expectSaveRefused(
    overrides: Partial<StructureDialogProps>,
    message: string,
    prepare: (instance: Instance) => void = () => undefined,
  ) {
    const onSave = vi.fn();
    const onClose = vi.fn();
    const { getByRole } = renderWithMantine(
      <KetcherDialog {...props({ onSave, onClose, ...overrides })} />,
    );
    await waitFor(() => expect(latest().setMolecule).toHaveBeenCalled());
    prepare(latest());
    await userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(showNotification).toHaveBeenCalledWith({
        variant: NotificationVariant.ERROR,
        message,
      }),
    );
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  }

  it('reports a drawing Ketcher will not write and stays open', async () => {
    // getMolfile refuses this way when the canvas holds a reaction arrow.
    const message = 'The structure cannot be saved as *.MOL due to reaction arrows.';
    await expectSaveRefused({ format: 'molfile' }, message, instance =>
      instance.getMolfile.mockRejectedValueOnce(new Error(message)),
    );
  });

  it('reports a getter that throws rather than rejects', async () => {
    // getSmiles throws synchronously, in macro mode for one.
    const message = 'SMILES format is not available in macro mode';
    await expectSaveRefused({ format: 'cxsmiles' }, message, instance =>
      instance.getSmiles.mockImplementationOnce(() => {
        throw new Error(message);
      }),
    );
  });

  it('refuses to write a reaction arrow as CXSMILES', async () => {
    // getSmiles would write reaction SMILES where its host expects a molecule.
    await expectSaveRefused(
      { format: 'cxsmiles' },
      'The structure cannot be saved as CXSMILES due to reaction arrows.',
      instance => instance.containsReaction.mockReturnValue(true),
    );
    expect(latest().getSmiles).not.toHaveBeenCalled();
  });

  it.each([
    // Ketcher reads |C:...| as single bonds: cisplatin would come back with NH2.
    ['coordinate bonds', '[NH3][Pt]([NH3])([Cl])[Cl] |C:0.0,2.1|'],
    // Ketcher drops |m:...|, cutting a haptic bond to the ring.
    ['multicenter attachments', 'c1ccccc1.[Fe].* |m:7:0.1.2.3.4.5|'],
  ])('refuses to save over the %s Ketcher cannot read', async (fields, initial) => {
    await expectSaveRefused(
      { initial, format: 'cxsmiles' },
      `Ketcher cannot read the ${fields} in this structure, so saving it would change it.`,
    );
    expect(latest().getSmiles).not.toHaveBeenCalled();
  });

  it('saves over a CXSMILES whose atom labels only look like those fields', async () => {
    const onSave = vi.fn();
    const { getByRole } = renderWithMantine(
      <KetcherDialog
        {...props({
          initial: 'CC(N)C(=O)O |$a,C:1;;;;;$|',
          format: 'cxsmiles',
          onSave,
        })}
      />,
    );
    await waitFor(() => expect(latest().setMolecule).toHaveBeenCalled());
    await userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
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
