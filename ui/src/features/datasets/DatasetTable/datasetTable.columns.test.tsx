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
import type { MouseEvent } from 'react';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { columns, handleMenu } from './datasetTable.columns.tsx';
import type { Dataset } from 'store/entities/datasets/datasets.types.ts';

// MRT passes a rich props object to Cell; these renderers only read row.original.
const renderCell = (columnId: string, original: Partial<Dataset>) => {
  const column = columns.find(c => c.id === columnId);
  if (!column?.Cell) throw new Error(`no Cell for column ${columnId}`);
  const Cell = column.Cell as (props: {
    row: { original: Partial<Dataset> };
  }) => JSX.Element;
  return renderWithMantine(<Cell row={{ original }} />);
};

describe('datasetTable.columns', () => {
  it('renders the dataset name, falling back to "Dataset <id>" when unnamed', () => {
    expect(
      renderCell('datasetName', { name: 'My Dataset', id: 1 }).getByText('My Dataset'),
    ).toBeInTheDocument();
    expect(
      renderCell('datasetName', { id: 7 }).getByText('Dataset 7'),
    ).toBeInTheDocument();
  });
});

describe('handleMenu', () => {
  it('stops propagation and prevents default so the row click does not fire', () => {
    const event = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    } as unknown as MouseEvent;
    handleMenu(event);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });
});
