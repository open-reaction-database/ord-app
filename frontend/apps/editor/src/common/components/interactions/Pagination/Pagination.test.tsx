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
import { screen, fireEvent } from '@testing-library/react';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { Pagination } from './Pagination.tsx';

describe('Pagination', () => {
  it('disables Previous on the first page and advances via Next', () => {
    const onPageChange = vi.fn();
    renderWithMantine(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={onPageChange}
        rowsPerPage={10}
        onRowsPerPageChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables Next on the last page', () => {
    renderWithMantine(
      <Pagination
        currentPage={3}
        totalPages={3}
        onPageChange={() => {}}
        rowsPerPage={10}
        onRowsPerPageChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });
});
