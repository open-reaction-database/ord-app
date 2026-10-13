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
import userEvent from '@testing-library/user-event';
import type * as ReactNS from 'react';
import { renderWithMantine } from '#testing/renderWithMantine.tsx';
import { StructureDialog } from './StructureDialog.tsx';

// Ketcher's chunk failing to download, as on a dropped connection or after a deploy
// replaced it: a module whose evaluation throws rejects its dynamic import the same way.
// The first import fails, and the next succeeds.
const imports = vi.hoisted(() => ({ count: 0 }));

vi.mock('./KetcherDialog.tsx', async () => {
  imports.count += 1;
  if (imports.count === 1) {
    throw new Error('Failed to fetch dynamically imported module');
  }
  const React = (await vi.importActual('react')) as typeof ReactNS;
  return {
    KetcherDialog: () =>
      React.createElement('div', { 'data-testid': 'ketcher-dialog' }),
  };
});

describe('StructureDialog when Ketcher cannot load', () => {
  // One test, because the import count is meaningful only in order.
  it('says so inside the dialog, leaves its host alone, and loads on a second try', async () => {
    const onClose = vi.fn();
    const { findByTestId, findByText, getByRole, getByText } = renderWithMantine(
      <div>
        <p>The host’s form</p>
        <StructureDialog
          opened
          onClose={onClose}
          onSave={vi.fn()}
          initial="CCO"
          format="molfile"
        />
      </div>,
    );
    expect(await findByText('Ketcher could not be loaded.')).toBeInTheDocument();
    expect(getByText('The host’s form')).toBeInTheDocument();
    await userEvent.click(getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();

    await userEvent.click(getByRole('button', { name: 'Try again' }));
    expect(await findByTestId('ketcher-dialog')).toBeInTheDocument();
    expect(imports.count).toBe(2);
  });
});
