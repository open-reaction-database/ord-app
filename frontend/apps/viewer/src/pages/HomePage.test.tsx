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
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAt } from '#test/render.tsx';
import { mockApi } from '#test/fetch.ts';
import { ASK_EXAMPLES, askPath, MAX_QUESTION } from '#ask/questions.ts';
import { HomePage } from '#pages/HomePage.tsx';

const DATASETS = [
  {
    dataset_id: 'ord_dataset-a',
    name: 'a',
    description: 'first',
    reactions: 1_000_000,
  },
  {
    dataset_id: 'ord_dataset-b',
    name: 'b',
    description: 'second',
    reactions: 1_400_000,
  },
  { dataset_id: 'ord_dataset-c', name: 'c', description: 'third', reactions: 12_345 },
];

const NEWEST = {
  dataset_id: 'ord_dataset-a/b',
  name: 'Ni-catalyzed couplings',
  description: 'A screen; see https://example.com for more.',
  reactions: 1536,
  arrived: '2023-03-02',
};

function failure(detail: string) {
  return () => new Response(JSON.stringify({ detail }), { status: 500 });
}

/** Renders the page over these answers to its two requests. */
function show({ datasets = DATASETS as unknown, newest = NEWEST as unknown } = {}) {
  mockApi({ 'GET /api/datasets': datasets, 'GET /api/datasets/newest': newest });
  return renderAt('/', <HomePage />);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('HomePage', () => {
  it('counts the reactions and datasets in the corpus', async () => {
    const { findByText, getByText } = show();
    expect(await findByText('2.4M')).toBeInTheDocument();
    expect(getByText('reactions')).toBeInTheDocument();
    expect(getByText('3')).toBeInTheDocument();
    expect(getByText('datasets')).toBeInTheDocument();
  });

  it('says why the counts could not be loaded', async () => {
    const { findByText } = show({ datasets: failure('the corpus is closed') });
    expect(await findByText(/the corpus is closed/)).toBeInTheDocument();
  });

  it('links to the datasets and to the About page', () => {
    const { getByRole } = show();
    expect(getByRole('link', { name: 'Browse datasets' })).toHaveAttribute(
      'href',
      '/datasets',
    );
    expect(getByRole('link', { name: 'Learn more' })).toHaveAttribute('href', '/about');
  });

  it('shows the newest dataset, linked to its page', async () => {
    const { findByText, getByRole, getByText } = show();
    expect(await findByText('Recently added · Mar 2, 2023')).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Ni-catalyzed couplings' }),
    ).toBeInTheDocument();
    expect(getByText('1,536 reactions')).toBeInTheDocument();
    expect(getByRole('link', { name: 'https://example.com' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'View dataset →' })).toHaveAttribute(
      'href',
      '/datasets/ord_dataset-a%2Fb',
    );
  });

  it('leaves the card out when no dataset has a first commit', async () => {
    const { container, queryByText } = show({ newest: null });
    // Each request shows a placeholder until it settles.
    await waitFor(() =>
      expect(container.querySelector('.mantine-Skeleton-root')).toBeNull(),
    );
    expect(queryByText(/Recently added/)).not.toBeInTheDocument();
  });

  it('says why the newest dataset could not be loaded', async () => {
    const { findByText } = show({ newest: failure('the corpus is closed') });
    expect(await findByText(/the corpus is closed/)).toBeInTheDocument();
  });

  it('asks a question on the ask page', async () => {
    const user = userEvent.setup();
    const { getByRole, history } = show();
    expect(getByRole('button', { name: 'Ask' })).toBeDisabled();
    await user.type(
      getByRole('textbox', { name: 'Question' }),
      '  what uses THF  {Enter}',
    );
    expect(history.at(-1)).toBe(askPath('what uses THF'));
  });

  it('asks an example question when it is clicked', async () => {
    const user = userEvent.setup();
    const { getByRole, history } = show();
    await user.click(getByRole('button', { name: ASK_EXAMPLES[1] }));
    expect(history.at(-1)).toBe(askPath(ASK_EXAMPLES[1]));
  });

  it('refuses a question longer than the backend takes', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText, history } = show();
    const box = getByRole('textbox', { name: 'Question' });
    await user.click(box);
    await user.paste('x'.repeat(MAX_QUESTION + 1));
    expect(getByText(`At most ${MAX_QUESTION} characters.`)).toBeInTheDocument();
    expect(getByRole('button', { name: 'Ask' })).toBeDisabled();
    await user.type(box, '{Enter}');
    expect(history).toEqual(['/']);
  });

  it('links to the structured search', () => {
    const { getByRole } = show();
    expect(
      getByRole('link', { name: 'Or search by structure and conditions →' }),
    ).toHaveAttribute('href', '/search');
  });
});
