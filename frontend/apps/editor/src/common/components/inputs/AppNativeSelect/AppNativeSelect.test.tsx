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
import { AppNativeSelect } from './AppNativeSelect.tsx';

describe('AppNativeSelect', () => {
  it('renders the options and reports the selected value as a string', () => {
    const onChange = vi.fn();
    renderWithMantine(
      <AppNativeSelect
        options={['x', 'y']}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'y' } });
    expect(onChange).toHaveBeenCalledWith('y');
  });
});
