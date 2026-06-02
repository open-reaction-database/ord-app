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
import { ValuePrecisionUnitControl } from './ValuePrecisionUnitControl.tsx';

describe('ValuePrecisionUnitControl', () => {
  it('renders the current value and the available unit options', () => {
    renderWithMantine(
      <ValuePrecisionUnitControl
        options={['G', 'MG']}
        value={{ value: 5, precision: null, units: 'G' }}
        onChange={() => {}}
      />,
    );
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    expect(screen.getByText('G')).toBeInTheDocument();
    expect(screen.getByText('MG')).toBeInTheDocument();
  });
});
