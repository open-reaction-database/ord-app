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
import { FileControl } from './FileControl.tsx';

describe('FileControl', () => {
  it('renders the labelled file input when there is no value', () => {
    renderWithMantine(
      <FileControl
        name="data"
        label="Data file"
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Data file')).toBeInTheDocument();
  });

  it('shows a download link for the stored file and clears it on remove', () => {
    const onChange = vi.fn();
    renderWithMantine(
      <FileControl
        name="molecule"
        label="File"
        value={{ value: 'YWJj', format: 'pb' }}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('link', { name: 'molecule.pb' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /remove file/i }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
