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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactNS from 'react';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { ComponentsKetcherEditor } from './ComponentsKetcherEditor.tsx';

// The real Ketcher editor pulls in a WASM struct-service and a canvas renderer that cannot run
// under happy-dom. We stub `ketcher-react`/`ketcher-standalone` and assert the integration
// contract our component relies on — the exact API surface (`onInit`, `setMolecule`,
// `getMolfile`) that a Ketcher major upgrade could silently break.
const ketcher = {
  setMolecule: vi.fn((_molecule: string) => undefined),
  getMolfile: vi.fn(() => Promise.resolve('MOLFILE')),
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

const identifier = { value: 'CCO', details: 'ethanol' };

describe('ComponentsKetcherEditor', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

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
        value: 'MOLFILE',
        details: 'ethanol',
      });
      expect(onClose).toHaveBeenCalled();
    });
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
