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
import { VIEWER0101, VIEWER0102 } from '#test/fixtures/records.ts';
import { ReactionList } from '#components/ReactionList.tsx';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ReactionList', () => {
  it("puts each card's actions on it", async () => {
    mockApi({ 'GET /api/reactions': [VIEWER0101] });
    const { findByRole } = renderAt(
      '/',
      <ReactionList
        reactionIds={['ord-viewer0101']}
        renderActions={record => (
          <button type="button">{`Pick ${record.reaction_id}`}</button>
        )}
      />,
    );
    expect(
      await findByRole('button', { name: 'Pick ord-viewer0101' }),
    ).toBeInTheDocument();
  });

  it('shows a card for each reaction, linking it and its dataset', async () => {
    mockApi({ 'GET /api/reactions': [VIEWER0101, VIEWER0102] });
    const { findByRole, getAllByRole, getByRole } = renderAt(
      '/',
      <ReactionList reactionIds={['ord-viewer0101', 'ord-viewer0102']} />,
    );
    expect(await findByRole('link', { name: 'ord-viewer0101' })).toHaveAttribute(
      'href',
      '/reactions/ord-viewer0101',
    );
    expect(getByRole('link', { name: 'ord-viewer0102' })).toBeInTheDocument();
    // Both reactions are in the first dataset, so each card links it.
    for (const link of getAllByRole('link', { name: 'ord_dataset-viewer01' })) {
      expect(link).toHaveAttribute('href', '/datasets/ord_dataset-viewer01');
    }
  });

  it('asks for one page of reactions at a time', async () => {
    const ids = Array.from({ length: 12 }, (_, index) => `ord-${index}`);
    const fetch = mockApi({ 'GET /api/reactions': [] });
    const user = userEvent.setup();
    const { getByRole } = renderAt('/', <ReactionList reactionIds={ids} />);
    await user.click(getByRole('button', { name: '2' }));
    const asked = fetch.mock.calls.map(([input]) =>
      new URL(String(input), 'http://viewer.test').searchParams.getAll('id'),
    );
    expect(asked).toEqual([ids.slice(0, 10), ids.slice(10)]);
  });

  it('names the reactions the corpus does not hold', async () => {
    mockApi({ 'GET /api/reactions': [VIEWER0101] });
    const { findByRole, getByRole } = renderAt(
      '/',
      <ReactionList reactionIds={['ord-viewer0101', 'ord-nowhere', 'ord-gone']} />,
    );
    await findByRole('link', { name: 'ord-viewer0101' });
    expect(getByRole('alert')).toHaveTextContent(
      'Not in the corpus: ord-nowhere, ord-gone.',
    );
  });

  it('names none when the corpus holds them all', async () => {
    mockApi({ 'GET /api/reactions': [VIEWER0101] });
    const { findByRole, queryByRole } = renderAt(
      '/',
      <ReactionList reactionIds={['ord-viewer0101']} />,
    );
    await findByRole('link', { name: 'ord-viewer0101' });
    expect(queryByRole('alert')).not.toBeInTheDocument();
  });

  it('says so when there is nothing to list', () => {
    const { getByText } = renderAt('/', <ReactionList reactionIds={[]} />);
    expect(getByText('No reactions.')).toBeInTheDocument();
  });

  it('says why a page could not load', async () => {
    mockApi({});
    const { findByRole } = renderAt(
      '/',
      <ReactionList reactionIds={['ord-viewer0101']} />,
    );
    expect(await findByRole('alert')).toHaveTextContent('Not found.');
  });
});
