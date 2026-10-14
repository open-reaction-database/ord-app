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
import { describe, expect, it } from 'vitest';
import { within } from '@testing-library/react';
import { renderAt } from '#test/render.tsx';
import { ResultTable } from '#components/ResultTable.tsx';

describe('ResultTable', () => {
  it('shows the columns and rows as they come, linking reaction IDs', () => {
    const { getByRole } = renderAt(
      '/',
      <ResultTable
        result={{
          kind: 'table',
          columns: ['reaction_id', 'yield', 'note'],
          rows: [
            ['ord-viewer0101', 65, null],
            ['ord-viewer0102', 90.5, 'x'],
          ],
          truncated: false,
        }}
      />,
    );
    const table = getByRole('table');
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map(cell => cell.textContent),
    ).toEqual(['reaction_id', 'yield', 'note']);
    expect(within(table).getByRole('link', { name: 'ord-viewer0102' })).toHaveAttribute(
      'href',
      '/reactions/ord-viewer0102',
    );
    expect(within(table).getByText('90.5')).toBeInTheDocument();
    expect(within(table).getByText('—')).toBeInTheDocument();
  });

  it('shows a structured value as JSON', () => {
    const { getByText } = renderAt(
      '/',
      <ResultTable
        result={{
          kind: 'table',
          columns: ['range'],
          rows: [[{ low: 1 }]],
          truncated: false,
        }}
      />,
    );
    expect(getByText('{"low":1}')).toBeInTheDocument();
  });

  it('says when the rows were cut short', () => {
    const { getByText } = renderAt(
      '/',
      <ResultTable
        result={{ kind: 'table', columns: ['n'], rows: [[1]], truncated: true }}
      />,
    );
    expect(getByText(/stopped at 1,000 rows/)).toBeInTheDocument();
  });
});
