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
import { AppSegmentedControl } from './AppSegmentedControl.tsx';

describe('AppSegmentedControl', () => {
  it('flattens options into segments and reports the chosen value', () => {
    const onChange = vi.fn();
    renderWithMantine(
      <AppSegmentedControl
        options={['Left', 'Right']}
        onChange={onChange}
        label="Side"
      />,
    );
    expect(screen.getByText('Side')).toBeInTheDocument();
    expect(screen.getByText('Left')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Right'));
    expect(onChange).toHaveBeenCalledWith('Right');
  });

  it('flattens grouped options into their items', () => {
    renderWithMantine(
      <AppSegmentedControl
        options={[{ group: 'G', items: ['One', 'Two'] }]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });
});
