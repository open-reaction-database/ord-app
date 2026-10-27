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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderAt } from '#test/render.tsx';
import { mockApi } from '#test/fetch.ts';
import { VIEWER0101 } from '#test/fixtures/records.ts';
import { ViewerRoutes } from '#routes.tsx';

vi.mock('@open-reaction-database/ui/ketcher', () => ({ StructureDialog: () => null }));

describe('ViewerRoutes', () => {
  // The pages behind the redirects fetch as they render; an empty corpus answers them.
  beforeEach(() => {
    mockApi({
      'GET /api/datasets': [],
      'GET /api/datasets/newest': null,
      'GET /api/reactions': [],
      'GET /api/reactions/ord-viewer0101': VIEWER0101,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the front page at /', () => {
    const { getByRole } = renderAt('/', <ViewerRoutes />);
    expect(
      getByRole('heading', { name: 'The Open Reaction Database' }),
    ).toBeInTheDocument();
  });

  it('shows the datasets at /datasets', async () => {
    const { findByRole } = renderAt('/datasets', <ViewerRoutes />);
    expect(await findByRole('heading', { name: 'Datasets' })).toBeInTheDocument();
  });

  it('shows a reaction at /reactions/:id', async () => {
    const { findByRole } = renderAt('/reactions/ord-viewer0101', <ViewerRoutes />);
    expect(await findByRole('heading', { name: 'ord-viewer0101' })).toBeInTheDocument();
  });

  it('shows the selected set at /reactions', () => {
    const { getByRole } = renderAt('/reactions?id=ord-viewer0101', <ViewerRoutes />);
    expect(getByRole('heading', { name: 'Selected reactions' })).toBeInTheDocument();
  });

  it('asks for a dataset whose ID holds an escaped character by its whole ID', async () => {
    const fetch = vi.mocked(globalThis.fetch);
    renderAt('/datasets/a%2Fb', <ViewerRoutes />);
    await vi.waitFor(() =>
      expect(fetch.mock.calls.map(([input]) => String(input))).toContain(
        '/api/datasets/a%2Fb',
      ),
    );
  });

  it('shows the search at /search', () => {
    const { getByRole } = renderAt('/search', <ViewerRoutes />);
    expect(getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('shows /ask', () => {
    const { getByRole } = renderAt('/ask', <ViewerRoutes />);
    expect(getByRole('heading', { name: 'Ask about reactions' })).toBeInTheDocument();
  });

  it('shows About', () => {
    const { getByRole } = renderAt('/about', <ViewerRoutes />);
    expect(getByRole('heading', { name: 'About' })).toBeInTheDocument();
  });

  it('shows NotFound for a path no route takes', () => {
    const { getByRole } = renderAt('/nowhere', <ViewerRoutes />);
    expect(getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  // Each redirect replaces the path it left, so history holds one entry.
  it.each([
    ['/browse', '/datasets'],
    ['/dataset/ord_dataset-01', '/datasets/ord_dataset-01'],
    ['/dataset/a%2Fb', '/datasets/a%2Fb'],
    ['/id/ord-0123', '/reactions/ord-0123'],
    ['/id/a%2Fb', '/reactions/a%2Fb'],
    [
      '/selected-set?reaction_id=ord-b&reaction_id=ord-a',
      '/reactions?id=ord-b&id=ord-a',
    ],
    ['/selected-set', '/reactions'],
  ])('redirects ord-interface’s %s to %s', (from, to) => {
    const { history } = renderAt(from, <ViewerRoutes />);
    expect(history).toEqual([to]);
  });
});
