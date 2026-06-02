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
import type { MRT_ColumnDef } from 'mantine-react-table';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { DataTable } from './DataTable.tsx';

interface Row {
  name: string;
}

const columns: Array<MRT_ColumnDef<Row>> = [{ accessorKey: 'name', header: 'Name' }];

describe('DataTable', () => {
  it('renders the column header and a cell for each row', () => {
    renderWithMantine(
      <DataTable
        columns={columns}
        data={[{ name: 'Acetone' }, { name: 'Water' }]}
      />,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Acetone')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
  });
});
