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
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { EnumerationResult } from './EnumerationResult.tsx';
import type { EnumerationProgress } from 'store/entities/enumeration/enumeration.types.ts';

const progress = (overrides: object) =>
  ({
    resultDatasetId: null,
    reactions: [],
    errors: [],
    ...overrides,
  }) as unknown as Required<EnumerationProgress>;

describe('EnumerationResult', () => {
  it('reports the number of reactions created on success', () => {
    const { getByText } = renderWithMantine(
      <EnumerationResult
        enumerationProgress={progress({ resultDatasetId: 5, reactions: [{}, {}] })}
        onClose={vi.fn()}
      />,
    );
    expect(getByText('Reactions created: 2')).toBeInTheDocument();
  });

  it('lists failed lines and shows "No reactions created" when none succeeded', () => {
    const { getByText } = renderWithMantine(
      <EnumerationResult
        enumerationProgress={progress({
          errors: [{ line: 3, message: 'invalid SMILES' }],
        })}
        onClose={vi.fn()}
      />,
    );
    expect(getByText('No reactions created')).toBeInTheDocument();
    expect(getByText('Failed to create lines:')).toBeInTheDocument();
    expect(getByText('Line 3:')).toBeInTheDocument();
    expect(getByText('invalid SMILES')).toBeInTheDocument();
  });
});
