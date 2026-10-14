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
import { Alert, Anchor, ScrollArea, Stack, Table } from '@mantine/core';
import { Link } from 'wouter';
import type { TableResult } from '#api/types.ts';
import { MAX_LIMIT } from '#search/form.ts';

function Cell({ column, value }: Readonly<{ column: string; value: unknown }>) {
  if (value === null || value === undefined) {
    return <>—</>;
  }
  if (column === 'reaction_id' && typeof value === 'string') {
    return (
      <Anchor
        component={Link}
        href={`/reactions/${encodeURIComponent(value)}`}
      >
        {value}
      </Anchor>
    );
  }
  return <>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</>;
}

/** A table result's columns and rows as they come, with reaction IDs linked. */
export function ResultTable({ result }: Readonly<{ result: TableResult }>) {
  return (
    <Stack gap="sm">
      {result.truncated && (
        <Alert
          color="yellow"
          variant="light"
        >
          The answer stopped at {MAX_LIMIT.toLocaleString()} rows; narrow the question
          to see the rest.
        </Alert>
      )}
      <ScrollArea>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              {result.columns.map((column, columnIndex) => (
                // A table's rows and columns are fixed, and a name may repeat, so each is
                // keyed by its place.
                <Table.Th key={columnIndex}>{column}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {result.rows.map((row, rowIndex) => (
              <Table.Tr key={rowIndex}>
                {result.columns.map((column, columnIndex) => (
                  <Table.Td key={columnIndex}>
                    <Cell
                      column={column}
                      value={row[columnIndex]}
                    />
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Stack>
  );
}
