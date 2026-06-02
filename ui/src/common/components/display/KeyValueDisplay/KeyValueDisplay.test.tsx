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
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { KeyValueDisplay } from './KeyValueDisplay.tsx';

describe('KeyValueDisplay', () => {
  it('renders the label with a colon and the value', () => {
    renderWithMantine(
      <KeyValueDisplay
        label="Name"
        value="Acetone"
      />,
    );
    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText('Acetone')).toBeInTheDocument();
  });

  it('renders the value in multiline mode', () => {
    renderWithMantine(
      <KeyValueDisplay
        label="Notes"
        value="line one"
        multiline
      />,
    );
    expect(screen.getByText('Notes:')).toBeInTheDocument();
    expect(screen.getByText('line one')).toBeInTheDocument();
  });
});
