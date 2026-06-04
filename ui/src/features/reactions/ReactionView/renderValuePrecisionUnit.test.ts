/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, it, expect, vi } from 'vitest';

// getFormattedValue (unit-symbol formatting) is the dependency, not the unit
// under test; stub it so the composition logic is asserted deterministically.
vi.mock('common/hooks/useTextFormatting', () => ({ getFormattedValue: (units: string) => `fmt:${units}` }));

import { renderValuePrecisionUnit } from './renderValuePrecisionUnit.ts';

describe('renderValuePrecisionUnit', () => {
  it('joins value, ± precision, and formatted units', () => {
    expect(renderValuePrecisionUnit({ value: 5, precision: 0.1, units: 'CELSIUS' })).toBe('5 ± 0.1 fmt:CELSIUS');
  });

  it('omits the precision segment when precision is falsy', () => {
    expect(renderValuePrecisionUnit({ value: 5, precision: 0, units: 'CELSIUS' })).toBe('5 fmt:CELSIUS');
  });

  it('omits units entirely when the units key is absent', () => {
    expect(renderValuePrecisionUnit({ value: 5, precision: 0.1 })).toBe('5 ± 0.1');
  });

  it('omits units when present but empty, leaving just the value', () => {
    expect(renderValuePrecisionUnit({ value: 5, precision: 0, units: '' })).toBe('5');
  });
});
