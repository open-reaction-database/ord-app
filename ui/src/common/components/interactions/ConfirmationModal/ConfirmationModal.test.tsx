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
import { ConfirmationModal } from './ConfirmationModal.tsx';

describe('ConfirmationModal', () => {
  it('renders the text and confirm/cancel actions when opened', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    renderWithMantine(
      <ConfirmationModal
        opened
        onClose={onClose}
        onConfirm={onConfirm}
        text="Delete this dataset?"
      />,
    );
    expect(screen.getByText('Delete this dataset?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});
