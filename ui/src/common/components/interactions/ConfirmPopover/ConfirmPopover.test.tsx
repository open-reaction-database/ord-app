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
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { ConfirmPopover } from './ConfirmPopover.tsx';

describe('ConfirmPopover', () => {
  it('renders the title/text and OK/Cancel actions when opened', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderWithMantine(
      <ConfirmPopover
        opened
        target={<button>open</button>}
        title="Delete reaction?"
        text="This cannot be undone."
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByText('Delete reaction?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  const renderPopover = (destructive?: boolean) =>
    renderWithMantine(
      <ConfirmPopover
        opened
        destructive={destructive}
        target={<button>open</button>}
        title="Remove?"
        text="x"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

  it('renders a red OK button for destructive confirmations (#314)', () => {
    renderPopover(true);
    // Mantine color="red" inlines the red color custom properties on the button element.
    expect(
      screen.getByRole('button', { name: 'OK' }).getAttribute('style') ?? '',
    ).toContain('red');
  });

  it('renders a default (non-red) OK button when not destructive', () => {
    renderPopover(false);
    expect(
      screen.getByRole('button', { name: 'OK' }).getAttribute('style') ?? '',
    ).not.toContain('red');
  });
});
