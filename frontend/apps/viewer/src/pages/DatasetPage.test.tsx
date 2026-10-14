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
import type { ReactNode } from 'react';
import { renderAt } from '#test/render.tsx';
import { mockApi } from '#test/fetch.ts';
import { VIEWER0101, VIEWER0102 } from '#test/fixtures/records.ts';
import { DatasetPage } from '#pages/DatasetPage.tsx';

vi.mock('@mantine/charts', () => ({ BarChart: (): ReactNode => null }));
vi.mock('@open-reaction-database/ui/reaction/previews', () => ({
  renderPreviews: vi.fn().mockResolvedValue({}),
}));

const DATASET = {
  dataset_id: 'ord_dataset-viewer01',
  name: 'viewer one',
  description: 'A Suzuki coupling and two acylations',
  reactions: 3,
};

function api(sample: Array<string>) {
  return mockApi({
    'GET /api/datasets/ord_dataset-viewer01': DATASET,
    'GET /api/datasets/ord_dataset-viewer01/compounds': [],
    'POST /api/search': { kind: 'reactions', reaction_ids: sample, truncated: false },
    'GET /api/reactions': [VIEWER0101, VIEWER0102],
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DatasetPage', () => {
  it('shows the dataset, its charts, and its reactions', async () => {
    api(['ord-viewer0101', 'ord-viewer0102']);
    const { findByRole, getByRole, getByText } = renderAt(
      '/datasets/ord_dataset-viewer01',
      <DatasetPage datasetId="ord_dataset-viewer01" />,
    );
    expect(await findByRole('heading', { name: 'viewer one' })).toBeInTheDocument();
    expect(getByText('ord_dataset-viewer01')).toBeInTheDocument();
    expect(getByText('A Suzuki coupling and two acylations')).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Most frequent inputs' })).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Most frequent products' }),
    ).toBeInTheDocument();
    expect(await findByRole('link', { name: 'ord-viewer0102' })).toBeInTheDocument();
  });

  it("asks for up to 100 of the dataset's reactions, in ID order", async () => {
    const fetch = api(['ord-viewer0101']);
    const { findByRole } = renderAt(
      '/datasets/ord_dataset-viewer01',
      <DatasetPage datasetId="ord_dataset-viewer01" />,
    );
    await findByRole('heading', { name: /reactions/i, level: 3 });
    const search = fetch.mock.calls.find(([input]) => String(input) === '/api/search');
    expect(JSON.parse(String(search?.[1]?.body))).toEqual({
      query: {
        where: {
          op: 'eq',
          path: 'dataset_id',
          value: { literal: 'ord_dataset-viewer01' },
        },
        order_by: [{ key: 'reaction_id' }],
        limit: 100,
      },
    });
  });

  it.each([
    [['ord-viewer0101', 'ord-viewer0102'], '2 reactions from this dataset (a sample)'],
    [
      ['ord-viewer0101', 'ord-viewer0102', 'ord-viewer0103'],
      'Reactions in this dataset (3)',
    ],
  ])('titles a sample of %j as %j', async (sample, title) => {
    api(sample);
    const { findByRole } = renderAt(
      '/datasets/ord_dataset-viewer01',
      <DatasetPage datasetId="ord_dataset-viewer01" />,
    );
    expect(await findByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('shows NotFound for a dataset the corpus does not hold', async () => {
    mockApi({});
    const { findByRole } = renderAt(
      '/datasets/ord_dataset-nowhere',
      <DatasetPage datasetId="ord_dataset-nowhere" />,
    );
    expect(await findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('says why the dataset could not load', async () => {
    mockApi({
      'GET /api/datasets/ord_dataset-viewer01': () =>
        new Response(JSON.stringify({ detail: 'busy' }), { status: 503 }),
    });
    const { findByRole } = renderAt(
      '/datasets/ord_dataset-viewer01',
      <DatasetPage datasetId="ord_dataset-viewer01" />,
    );
    expect(await findByRole('alert')).toHaveTextContent('busy or unavailable');
  });
});
