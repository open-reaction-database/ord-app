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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderAt } from '#test/render.tsx';
import { mockApi } from '#test/fetch.ts';
import { VIEWER0101, VIEWER0102 } from '#test/fixtures/records.ts';
import { ReactionSetPage } from '#pages/ReactionSetPage.tsx';
import { selectedIds } from '#reaction/selectedIds.ts';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('selectedIds', () => {
  it('keeps the IDs in the order first given, once each', () => {
    expect(selectedIds(new URLSearchParams('id=b&id=a&id=b&id='))).toEqual({
      ids: ['b', 'a'],
      dropped: 0,
    });
  });

  it('keeps the first 100, and counts the rest', () => {
    const params = new URLSearchParams(
      Array.from({ length: 120 }, (_, index) => ['id', `ord-${index}`]),
    );
    const { ids, dropped } = selectedIds(params);
    expect(ids).toHaveLength(100);
    expect(ids[99]).toBe('ord-99');
    expect(dropped).toBe(20);
  });
});

describe('ReactionSetPage', () => {
  it('shows the selected reactions', async () => {
    mockApi({ 'GET /api/reactions': [VIEWER0102, VIEWER0101] });
    const { findByRole, getByRole } = renderAt(
      '/reactions?id=ord-viewer0102&id=ord-viewer0101',
      <ReactionSetPage />,
    );
    expect(await findByRole('link', { name: 'ord-viewer0102' })).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Selected reactions' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Download all' })).toBeEnabled();
  });

  it('says how many past 100 it left out', async () => {
    mockApi({ 'GET /api/reactions': [] });
    const ids = Array.from({ length: 103 }, (_, index) => `id=ord-${index}`).join('&');
    const { findByText } = renderAt(`/reactions?${ids}`, <ReactionSetPage />);
    expect(
      await findByText('A set holds at most 100 reactions; the other 3 are left out.'),
    ).toBeInTheDocument();
  });

  it('says so when nothing is selected', () => {
    const { getByText } = renderAt('/reactions', <ReactionSetPage />);
    expect(getByText('No reactions.')).toBeInTheDocument();
  });
});
