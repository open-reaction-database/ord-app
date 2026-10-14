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
import { Group, NativeSelect, Pagination, Text } from '@mantine/core';
import { useMemo, useState, type ReactNode } from 'react';

/** The page sizes offered, as ord-interface's tables offer them. */
export const PAGE_SIZES = [10, 25, 50, 100];

/**
 * Splits items into pages, with controls for the page and its size.
 *
 * New items, or a new page size, start again from the first page. Callers keep the
 * same items array between renders (for example with useMemo), since a new array is
 * read as new items.
 */
export function usePaging<T>(
  items: ReadonlyArray<T>,
  noun: string,
): { pageItems: ReadonlyArray<T>; controls: ReactNode } {
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [pagedItems, setPagedItems] = useState(items);
  if (pagedItems !== items) {
    setPagedItems(items);
    setPage(1);
  }
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pageCount);
  const pageItems = useMemo(
    () => items.slice((current - 1) * pageSize, current * pageSize),
    [items, current, pageSize],
  );
  const controls = (
    <Group
      justify="space-between"
      wrap="wrap"
      gap="sm"
    >
      <Group gap="xs">
        <Text size="sm">Showing</Text>
        <NativeSelect
          aria-label="Per page"
          size="xs"
          data={PAGE_SIZES.map(String)}
          value={String(pageSize)}
          onChange={event => {
            setPageSize(Number(event.currentTarget.value));
            setPage(1);
          }}
        />
        <Text size="sm">
          of {items.length.toLocaleString()} {noun}
        </Text>
      </Group>
      <Pagination
        size="sm"
        total={pageCount}
        value={current}
        onChange={setPage}
      />
    </Group>
  );
  return { pageItems, controls };
}
