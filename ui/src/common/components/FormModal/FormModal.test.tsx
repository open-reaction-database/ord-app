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
import { FormModal } from './FormModal.tsx';

describe('FormModal', () => {
  it('renders the title, content, and default submit label, wiring up close/submit', () => {
    const onClose = vi.fn();
    // FormModal types onSubmit as () => void but wires it to the form's onSubmit; preventDefault
    // via an optional event param keeps it type-compatible while avoiding a jsdom navigation.
    const onSubmit = vi.fn((event?: { preventDefault: () => void }) => event?.preventDefault());
    renderWithMantine(
      <FormModal
        title="New dataset"
        onClose={onClose}
        onSubmit={onSubmit}
      >
        <span>body content</span>
      </FormModal>,
    );
    expect(screen.getByText('New dataset')).toBeInTheDocument();
    expect(screen.getByText('body content')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('uses a custom submit label when provided', () => {
    renderWithMantine(
      <FormModal
        title="t"
        onClose={() => {}}
        onSubmit={() => {}}
        submitTitle="Save"
      >
        <span>x</span>
      </FormModal>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
