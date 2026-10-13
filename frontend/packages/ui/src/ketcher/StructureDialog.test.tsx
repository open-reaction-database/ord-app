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
import { act } from '@testing-library/react';
import type * as ReactNS from 'react';
import { renderWithMantine } from '#testing/renderWithMantine.tsx';
import { StructureDialog } from './StructureDialog.tsx';
import type { StructureDialogProps } from './structure.types.ts';

// Counts how often the dialog's module is evaluated, which happens when it is imported.
const evaluations = vi.hoisted(() => ({ count: 0 }));

vi.mock('./KetcherDialog.tsx', async () => {
  evaluations.count += 1;
  const React = (await vi.importActual('react')) as typeof ReactNS;
  return {
    KetcherDialog: (props: Readonly<StructureDialogProps>) =>
      React.createElement(
        'div',
        { 'data-testid': 'ketcher-dialog', 'data-opened': String(props.opened) },
        props.initial,
      ),
  };
});

function props(opened: boolean, initial = 'CCO'): StructureDialogProps {
  return { opened, initial, onClose: vi.fn(), onSave: vi.fn(), format: 'smiles' };
}

describe('StructureDialog', () => {
  // One test, because the module is evaluated once per file, so the count is meaningful
  // only in order.
  it('loads Ketcher only when first opened, and keeps it mounted after closing', async () => {
    const { queryByTestId, findByTestId, getByTestId, rerender } = renderWithMantine(
      <StructureDialog {...props(false)} />,
    );
    // Long enough for an import already under way to finish: it resolves a mocked module.
    await act(() => new Promise(resolve => setTimeout(resolve, 50)));
    expect(queryByTestId('ketcher-dialog')).not.toBeInTheDocument();
    expect(evaluations.count).toBe(0);

    rerender(<StructureDialog {...props(true)} />);
    expect(await findByTestId('ketcher-dialog')).toHaveAttribute('data-opened', 'true');
    expect(evaluations.count).toBe(1);

    rerender(<StructureDialog {...props(false)} />);
    expect(getByTestId('ketcher-dialog')).toHaveAttribute('data-opened', 'false');

    rerender(<StructureDialog {...props(true, 'CCN')} />);
    expect(getByTestId('ketcher-dialog')).toHaveTextContent('CCN');
    expect(evaluations.count).toBe(1);
  });
});
