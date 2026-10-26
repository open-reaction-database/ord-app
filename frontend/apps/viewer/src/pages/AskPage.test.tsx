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
import { Link } from 'wouter';
import { renderAt } from '#test/render.tsx';
import { mockApi } from '#test/fetch.ts';
import { VIEWER0103 } from '#test/fixtures/records.ts';
import { ASK_EXAMPLES, askPath } from '#ask/questions.ts';
import { AskPage } from '#pages/AskPage.tsx';

const QUESTION = 'reactions that use ethylamine';
const ANSWER = {
  query: {
    where: { op: 'eq', path: 'reaction_id', value: { literal: 'ord-viewer0103' } },
  },
  text: 'One reaction uses ethylamine.',
  result: { kind: 'reactions', reaction_ids: ['ord-viewer0103'], truncated: false },
};

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('AskPage', () => {
  it('says the feature is in beta', () => {
    const { getByText } = renderAt('/ask', <AskPage />);
    expect(getByText(/in beta/)).toBeInTheDocument();
  });

  it('says where a question is sent', () => {
    const { getByText } = renderAt('/ask', <AskPage />);
    expect(getByText(/sent to Anthropic/)).toBeInTheDocument();
  });

  it("asks the URL's question and shows the answer", async () => {
    const fetch = mockApi({
      'POST /api/ask': ANSWER,
      'GET /api/reactions': [VIEWER0103],
    });
    const { findByText, findByRole } = renderAt(
      `/ask?q=${encodeURIComponent(QUESTION)}`,
      <AskPage />,
    );
    expect(await findByText('One reaction uses ethylamine.')).toBeInTheDocument();
    expect(await findByRole('link', { name: 'ord-viewer0103' })).toBeInTheDocument();
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual({
      question: QUESTION,
      structures: {},
    });
  });

  it('asks with the structures the URL names, and shows each in its field', async () => {
    const fetch = mockApi({
      'POST /api/ask': ANSWER,
      'GET /api/reactions': [VIEWER0103],
    });
    const { findByText, getByRole } = renderAt(
      askPath('reactions that use @A', { '@A': 'CCN' }),
      <AskPage />,
    );
    expect(await findByText('One reaction uses ethylamine.')).toBeInTheDocument();
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual({
      question: 'reactions that use @A',
      structures: { '@A': 'CCN' },
    });
    expect(getByRole('textbox', { name: 'Question' })).toHaveValue(
      'reactions that use @A',
    );
    expect(getByRole('textbox', { name: 'Structure @A' })).toHaveValue('CCN');
  });

  it('shows the query the question compiled to, folded away', async () => {
    const user = userEvent.setup();
    mockApi({ 'POST /api/ask': ANSWER, 'GET /api/reactions': [VIEWER0103] });
    const { findByRole } = renderAt(
      `/ask?q=${encodeURIComponent(QUESTION)}`,
      <AskPage />,
    );
    const toggle = await findByRole('button', { name: 'The query it ran' });
    await user.click(toggle);
    expect(await findByRole('region', { name: 'The query it ran' })).toHaveTextContent(
      '"literal": "ord-viewer0103"',
    );
  });

  it("says when the answer stopped at its query's limit", async () => {
    mockApi({
      'POST /api/ask': { ...ANSWER, query: { ...ANSWER.query, limit: 1 } },
      'GET /api/reactions': [VIEWER0103],
    });
    const { findByText } = renderAt(
      `/ask?q=${encodeURIComponent(QUESTION)}`,
      <AskPage />,
    );
    expect(
      await findByText(
        /stopped at its limit of 1; ask for more reactions to see the rest/,
      ),
    ).toBeInTheDocument();
  });

  it('shows a table answer as a table', async () => {
    mockApi({
      'POST /api/ask': {
        ...ANSWER,
        result: { kind: 'table', columns: ['n'], rows: [[5]], truncated: false },
      },
    });
    const { findByRole } = renderAt(
      `/ask?q=${encodeURIComponent(QUESTION)}`,
      <AskPage />,
    );
    expect(await findByRole('table')).toHaveTextContent('5');
  });

  it('puts a typed question in the URL', async () => {
    mockApi({});
    const user = userEvent.setup();
    const { getByRole, history } = renderAt('/ask', <AskPage />);
    await user.type(getByRole('textbox', { name: 'Question' }), QUESTION);
    await user.click(getByRole('button', { name: 'Ask' }));
    expect(new URLSearchParams(history.at(-1)!.split('?')[1]).get('q')).toBe(QUESTION);
  });

  it('asks an example', async () => {
    mockApi({});
    const user = userEvent.setup();
    const { getByRole, history } = renderAt('/ask', <AskPage />);
    await user.click(getByRole('button', { name: ASK_EXAMPLES[0] }));
    expect(new URLSearchParams(history.at(-1)!.split('?')[1]).get('q')).toBe(
      ASK_EXAMPLES[0],
    );
  });

  it("shows the URL's question in the box when the URL changes", async () => {
    mockApi({});
    const user = userEvent.setup();
    const { getByRole } = renderAt(
      `/ask?q=${encodeURIComponent(QUESTION)}`,
      <>
        <AskPage />
        <Link href={`/ask?${new URLSearchParams({ q: ASK_EXAMPLES[1] })}`}>
          elsewhere
        </Link>
      </>,
    );
    const box = getByRole('textbox', { name: 'Question' });
    expect(box).toHaveValue(QUESTION);
    await user.type(box, ' and more');
    await user.click(getByRole('link', { name: 'elsewhere' }));
    expect(getByRole('textbox', { name: 'Question' })).toHaveValue(ASK_EXAMPLES[1]);
  });

  it('asks the same question again after a failure', async () => {
    const user = userEvent.setup();
    let release = (_: Response) => {};
    const answers = [
      () => new Response(JSON.stringify({ detail: 'busy' }), { status: 503 }),
      () => new Promise<Response>(resolve => (release = resolve)),
    ];
    mockApi({
      'POST /api/ask': () => answers.shift()!(),
      'GET /api/reactions': [VIEWER0103],
    });
    const { findByRole, findByText, getByRole, queryByRole } = renderAt(
      `/ask?q=${encodeURIComponent(QUESTION)}`,
      <AskPage />,
    );
    expect(await findByRole('alert')).toHaveTextContent('try again shortly');
    await user.click(getByRole('button', { name: 'Ask' }));
    await vi.waitFor(() => expect(queryByRole('alert')).not.toBeInTheDocument());
    release(new Response(JSON.stringify(ANSWER)));
    expect(await findByText('One reaction uses ethylamine.')).toBeInTheDocument();
  });

  it('asks an answered question only once', async () => {
    const user = userEvent.setup();
    const fetch = mockApi({
      'POST /api/ask': ANSWER,
      'GET /api/reactions': [VIEWER0103],
    });
    const { findByText, getByRole } = renderAt(
      `/ask?q=${encodeURIComponent(QUESTION)}`,
      <AskPage />,
    );
    await findByText('One reaction uses ethylamine.');
    await user.click(getByRole('button', { name: 'Ask' }));
    const asks = fetch.mock.calls.filter(([input]) =>
      String(input).endsWith('/api/ask'),
    );
    expect(asks).toHaveLength(1);
  });

  it('refuses an empty or overlong question', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderAt('/ask', <AskPage />);
    expect(getByRole('button', { name: 'Ask' })).toBeDisabled();
    await user.click(getByRole('textbox', { name: 'Question' }));
    await user.paste('x'.repeat(2001));
    expect(getByRole('button', { name: 'Ask' })).toBeDisabled();
  });

  it('bounds the question after trimming, as the backend does', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderAt('/ask', <AskPage />);
    await user.click(getByRole('textbox', { name: 'Question' }));
    await user.paste(`${'x'.repeat(2000)}   `);
    expect(getByRole('button', { name: 'Ask' })).toBeEnabled();
  });

  it('counts characters as the backend does, not UTF-16 units', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText, queryByText } = renderAt('/ask', <AskPage />);
    await user.click(getByRole('textbox', { name: 'Question' }));
    await user.paste('\u{1F600}'.repeat(2000));
    expect(queryByText('At most 2000 characters.')).not.toBeInTheDocument();
    await user.paste('\u{1F600}');
    expect(getByText('At most 2000 characters.')).toBeInTheDocument();
  });

  it('asks nothing for a blank question in the URL', () => {
    const fetch = mockApi({});
    renderAt('/ask?q=%20%20', <AskPage />);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows the server's reason for a question it cannot answer", async () => {
    mockApi({
      'POST /api/ask': () =>
        new Response(JSON.stringify({ detail: 'the corpus records no prices' }), {
          status: 422,
        }),
    });
    const { findByRole } = renderAt('/ask?q=what%20does%20it%20cost', <AskPage />);
    expect(await findByRole('alert')).toHaveTextContent('the corpus records no prices');
  });
});
