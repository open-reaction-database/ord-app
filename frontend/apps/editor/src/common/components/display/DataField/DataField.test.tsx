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
import { DataField } from './DataField.tsx';

describe('DataField', () => {
  it('renders the label alongside its children', () => {
    renderWithMantine(
      <DataField label="Yield">
        <span>95%</span>
      </DataField>,
    );
    expect(screen.getByText('Yield')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });
});
