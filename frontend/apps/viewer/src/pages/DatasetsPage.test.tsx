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
import userEvent from '@testing-library/user-event';
import { within } from '@testing-library/react';
import { renderAt } from '#test/render.tsx';
import { mockApi } from '#test/fetch.ts';
import { DatasetsPage } from '#pages/DatasetsPage.tsx';

const DATASETS = Array.from({ length: 12 }, (_, index) => ({
  dataset_id: `ord_dataset-${index}`,
  name: `dataset ${index}`,
  description:
    index === 0 ? 'See https://example.com for more.' : `description ${index}`,
  reactions: 1000 + index,
}));

afterEach(() => {
  vi.restoreAllMocks();
});

function rows(table: HTMLElement) {
  return within(table).getAllByRole('row').slice(1);
}

describe('DatasetsPage', () => {
  it('lists the first page of datasets, each linked to its page', async () => {
    mockApi({ 'GET /api/datasets': DATASETS });
    const { findByRole } = renderAt('/', <DatasetsPage />);
    const table = await findByRole('table');
    expect(rows(table)).toHaveLength(10);
    expect(within(table).getByRole('link', { name: 'dataset 3' })).toHaveAttribute(
      'href',
      '/datasets/ord_dataset-3',
    );
    expect(within(table).getByText('1,003')).toBeInTheDocument();
  });

  it('filters as the user types', async () => {
    mockApi({ 'GET /api/datasets': DATASETS });
    const user = userEvent.setup();
    const { findByRole, getByRole } = renderAt('/', <DatasetsPage />);
    const table = await findByRole('table');
    await user.type(getByRole('textbox', { name: 'Filter' }), 'dataset 11');
    expect(rows(table)).toHaveLength(1);
  });

  it('links the addresses in a description, and shows it whole in a modal', async () => {
    mockApi({ 'GET /api/datasets': DATASETS });
    const user = userEvent.setup();
    const { findByRole, getAllByRole } = renderAt('/', <DatasetsPage />);
    const table = await findByRole('table');
    expect(
      within(table).getByRole('link', { name: 'https://example.com' }),
    ).toBeInTheDocument();
    await user.click(
      getAllByRole('button', { name: 'Show all of the description' })[0],
    );
    // The modal renders in a portal, outside the table but inside the document.
    expect(await findByRole('dialog', { name: 'dataset 0' })).toHaveTextContent(
      'See https://example.com for more.',
    );
  });

  it('closes the description', async () => {
    mockApi({ 'GET /api/datasets': DATASETS });
    const user = userEvent.setup();
    const { findByRole, getAllByRole, queryByRole } = renderAt('/', <DatasetsPage />);
    await findByRole('table');
    await user.click(
      getAllByRole('button', { name: 'Show all of the description' })[0],
    );
    await findByRole('dialog', { name: 'dataset 0' });
    await user.keyboard('{Escape}');
    await vi.waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('says why the datasets could not load', async () => {
    mockApi({
      'GET /api/datasets': () =>
        new Response('<html>Bad Gateway</html>', { status: 502 }),
    });
    const { findByRole } = renderAt('/', <DatasetsPage />);
    expect(await findByRole('alert')).toHaveTextContent('busy or unavailable');
  });
});
