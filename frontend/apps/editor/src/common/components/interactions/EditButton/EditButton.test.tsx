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
import { EditButton } from './EditButton.tsx';

describe('EditButton', () => {
  it('shows the default "Edit" label and fires onClick', () => {
    const onClick = vi.fn();
    renderWithMantine(<EditButton onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders custom children in place of the default label', () => {
    renderWithMantine(<EditButton>Rename</EditButton>);
    expect(screen.getByRole('button', { name: 'Rename' })).toBeInTheDocument();
  });
});
