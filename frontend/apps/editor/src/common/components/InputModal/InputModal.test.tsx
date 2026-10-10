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
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { InputModal } from './InputModal.tsx';

describe('InputModal', () => {
  it('renders the title and the input seeded with the initial value', () => {
    renderWithMantine(
      <InputModal
        title="Rename dataset"
        onClose={() => {}}
        onSubmit={async () => {}}
        inputLabel="Name"
        initialValue="old name"
      />,
    );
    expect(screen.getByText('Rename dataset')).toBeInTheDocument();
    expect(screen.getByDisplayValue('old name')).toBeInTheDocument();
  });

  it('forwards maxLength to the input when provided', () => {
    renderWithMantine(
      <InputModal
        title="Create Group"
        onClose={() => {}}
        onSubmit={async () => {}}
        inputLabel="Group name"
        maxLength={512}
      />,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '512');
  });

  it('leaves the input unbounded when maxLength is omitted', () => {
    renderWithMantine(
      <InputModal
        title="Create Group"
        onClose={() => {}}
        onSubmit={async () => {}}
        inputLabel="Group name"
      />,
    );
    expect(screen.getByRole('textbox')).not.toHaveAttribute('maxlength');
  });

  it('submits the current value', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithMantine(
      <InputModal
        title="Rename"
        onClose={() => {}}
        onSubmit={onSubmit}
        inputLabel="Name"
        initialValue="kept"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('kept'));
  });
});
