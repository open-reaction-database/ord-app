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
import { renderPreviews } from '@open-reaction-database/ui/reaction/previews';
import { renderAt } from '#test/render.tsx';
import { mockApi } from '#test/fetch.ts';
import { CompoundChart, CompoundTooltip } from '#components/CompoundChart.tsx';

// recharts measures its container, which happy-dom gives no size; the test reads what
// the chart is given instead.
vi.mock('@mantine/charts', () => ({
  BarChart: ({
    data,
  }: {
    readonly data: Array<{ smiles: string; count: number }>;
  }): ReactNode => (
    <ol aria-label="bars">
      {data.map(point => (
        <li key={point.smiles}>{`${point.smiles} ${point.count}`}</li>
      ))}
    </ol>
  ),
}));
vi.mock('@open-reaction-database/ui/reaction/previews', () => ({
  renderPreviews: vi.fn(),
}));

const COMPOUNDS = [
  { smiles: 'CC(=O)Cl', molblock: 'acetyl chloride molblock', count: 2 },
  { smiles: 'CCN', molblock: null, count: 1 },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CompoundChart', () => {
  it("draws the side's compounds in the order counted", async () => {
    vi.mocked(renderPreviews).mockResolvedValue({});
    const fetch = mockApi({ 'GET /api/datasets/ord_dataset-1/compounds': COMPOUNDS });
    const { findAllByRole, getByRole } = renderAt(
      '/',
      <CompoundChart
        datasetId="ord_dataset-1"
        side="products"
        title="Most frequent products"
      />,
    );
    expect((await findAllByRole('listitem')).map(item => item.textContent)).toEqual([
      'CC(=O)Cl 2',
      'CCN 1',
    ]);
    expect(
      getByRole('heading', { name: 'Most frequent products' }),
    ).toBeInTheDocument();
    expect(String(fetch.mock.calls[0][0])).toBe(
      '/api/datasets/ord_dataset-1/compounds?side=products',
    );
  });

  it("renders every compound's molecule once, keyed by its place", async () => {
    vi.mocked(renderPreviews).mockResolvedValue({});
    mockApi({ 'GET /api/datasets/ord_dataset-1/compounds': COMPOUNDS });
    const { findAllByRole } = renderAt(
      '/',
      <CompoundChart
        datasetId="ord_dataset-1"
        side="inputs"
        title="Most frequent inputs"
      />,
    );
    await findAllByRole('listitem');
    expect(renderPreviews).toHaveBeenCalledWith(
      { 0: 'acetyl chloride molblock', 1: null },
      { size: 160 },
    );
  });

  it('says so when the dataset has no compounds on that side', async () => {
    mockApi({ 'GET /api/datasets/ord_dataset-1/compounds': [] });
    const { findByText, queryByRole } = renderAt(
      '/',
      <CompoundChart
        datasetId="ord_dataset-1"
        side="inputs"
        title="Most frequent inputs"
      />,
    );
    expect(await findByText('No compounds to count.')).toBeInTheDocument();
    expect(queryByRole('list', { name: 'bars' })).not.toBeInTheDocument();
  });

  it('says why the counts could not load', async () => {
    mockApi({
      'GET /api/datasets/ord_dataset-1/compounds': () =>
        new Response(JSON.stringify({ detail: 'busy' }), { status: 503 }),
    });
    const { findByRole } = renderAt(
      '/',
      <CompoundChart
        datasetId="ord_dataset-1"
        side="inputs"
        title="Most frequent inputs"
      />,
    );
    expect(await findByRole('alert')).toHaveTextContent('busy or unavailable');
  });
});

describe('CompoundTooltip', () => {
  it('shows the molecule, its SMILES, and its count', () => {
    const { getByRole, getByText } = renderAt(
      '/',
      <CompoundTooltip
        smiles="CCN"
        count={1234}
        image="c3Zn"
      />,
    );
    expect(getByRole('img', { name: 'CCN' })).toHaveAttribute(
      'src',
      'data:image/svg+xml;base64,c3Zn',
    );
    expect(getByText('CCN')).toBeInTheDocument();
    expect(getByText('1,234 occurrences')).toBeInTheDocument();
  });

  it('shows the SMILES alone when there is no image', () => {
    const { queryByRole, getByText } = renderAt(
      '/',
      <CompoundTooltip
        smiles="CCN"
        count={1}
        image={null}
      />,
    );
    expect(queryByRole('img')).not.toBeInTheDocument();
    expect(getByText('1 occurrence')).toBeInTheDocument();
  });
});
