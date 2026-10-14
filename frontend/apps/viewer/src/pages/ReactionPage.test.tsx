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
import { renderAt } from '#test/render.tsx';
import { mockApi } from '#test/fetch.ts';
import { VIEWER0101 } from '#test/fixtures/records.ts';
import { downloadReactions } from '#api/download.ts';
import { ReactionPage } from '#pages/ReactionPage.tsx';

vi.mock('#api/download.ts', () => ({ downloadReactions: vi.fn() }));

const DATASETS = [
  {
    dataset_id: 'ord_dataset-viewer01',
    name: 'viewer one',
    description: 'x',
    reactions: 3,
  },
];

afterEach(() => {
  vi.restoreAllMocks();
});

function show() {
  mockApi({
    'GET /api/reactions/ord-viewer0101': VIEWER0101,
    'GET /api/datasets': DATASETS,
  });
  return renderAt(
    '/reactions/ord-viewer0101',
    <ReactionPage reactionId="ord-viewer0101" />,
  );
}

describe('ReactionPage', () => {
  it('shows the reaction, under its dataset', async () => {
    const { findByRole, getByRole } = show();
    expect(await findByRole('heading', { name: 'ord-viewer0101' })).toBeInTheDocument();
    expect(await findByRole('link', { name: 'viewer one' })).toHaveAttribute(
      'href',
      '/datasets/ord_dataset-viewer01',
    );
    expect(getByRole('radio', { name: 'Tabs' })).toBeChecked();
  });

  it('switches between tabs and a list', async () => {
    const user = userEvent.setup();
    const { findByRole, getByRole, queryAllByRole } = show();
    await findByRole('heading', { name: 'ord-viewer0101' });
    expect(getByRole('tab', { name: /inputs/i })).toBeInTheDocument();
    await user.click(getByRole('radio', { name: 'List' }));
    expect(getByRole('radio', { name: 'List' })).toBeChecked();
    await vi.waitFor(() => expect(queryAllByRole('tab')).toHaveLength(0));
  });

  it('leaves the dataset out of the breadcrumbs when the record names none', async () => {
    mockApi({
      'GET /api/reactions/ord-viewer0101': { ...VIEWER0101, dataset_id: null },
      'GET /api/datasets': DATASETS,
    });
    const { findByRole, getAllByRole } = renderAt(
      '/reactions/ord-viewer0101',
      <ReactionPage reactionId="ord-viewer0101" />,
    );
    await findByRole('heading', { name: 'ord-viewer0101' });
    // The dataset's breadcrumb is the only link on a reaction page into a dataset.
    const datasetLinks = getAllByRole('link')
      .map(link => link.getAttribute('href'))
      .filter(href => href?.startsWith('/datasets/'));
    expect(datasetLinks).toEqual([]);
    expect(getAllByRole('link', { name: 'Datasets' })).not.toHaveLength(0);
  });

  it('offers no way to edit it', async () => {
    const { findByRole, queryByRole } = show();
    await findByRole('heading', { name: 'ord-viewer0101' });
    expect(queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('downloads the reaction', async () => {
    vi.mocked(downloadReactions).mockResolvedValue(undefined);
    const user = userEvent.setup();
    const { findByRole } = show();
    await user.click(await findByRole('button', { name: 'Download' }));
    expect(downloadReactions).toHaveBeenCalledWith(['ord-viewer0101']);
  });

  it('shows NotFound for a reaction the corpus does not hold', async () => {
    mockApi({ 'GET /api/datasets': DATASETS });
    const { findByRole } = renderAt(
      '/reactions/ord-nowhere',
      <ReactionPage reactionId="ord-nowhere" />,
    );
    expect(await findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('says why the reaction could not load', async () => {
    mockApi({
      'GET /api/reactions/ord-viewer0101': () =>
        new Response(JSON.stringify({ detail: 'busy' }), { status: 503 }),
    });
    const { findByRole } = renderAt(
      '/reactions/ord-viewer0101',
      <ReactionPage reactionId="ord-viewer0101" />,
    );
    expect(await findByRole('alert')).toHaveTextContent('busy or unavailable');
  });
});
