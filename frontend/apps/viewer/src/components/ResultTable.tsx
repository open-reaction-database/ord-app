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

/** A cell's value as text: strings, numbers, and booleans as written, the rest as JSON. */
function cellText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
}

/**
 * Each item with a key from its content, numbered among the items that share it, so no
 * two keys collide whatever the table holds.
 */
function keyed<T>(
  items: ReadonlyArray<T>,
  identify: (item: T) => string,
): Array<{ key: string; item: T }> {
  const seen = new Map<string, number>();
  return items.map(item => {
    const identity = identify(item);
    const count = seen.get(identity) ?? 0;
    seen.set(identity, count + 1);
    return { key: `${count}:${identity}`, item };
  });
}

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
  return <>{cellText(value)}</>;
}

/** A table result's columns and rows as they come, with reaction IDs linked. */
export function ResultTable({ result }: Readonly<{ result: TableResult }>) {
  const columns = keyed(result.columns, column => column);
  const rows = keyed(result.rows, row => JSON.stringify(row));
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
              {columns.map(({ key, item: column }) => (
                <Table.Th key={key}>{column}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map(({ key: rowKey, item: row }) => (
              <Table.Tr key={rowKey}>
                {columns.map(({ key, item: column }, columnIndex) => (
                  <Table.Td key={key}>
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
