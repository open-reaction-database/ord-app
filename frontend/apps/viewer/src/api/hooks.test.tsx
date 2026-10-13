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
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createQueryClient } from '#api/queryClient.ts';
import {
  REACTIONS_PER_REQUEST,
  useAsk,
  useCompounds,
  useDataset,
  useDatasets,
  useReaction,
  useReactions,
  useSearch,
} from '#api/hooks.ts';

function wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <QueryClientProvider client={createQueryClient()}>{children}</QueryClientProvider>
  );
}

function respond(body: unknown) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(() => Promise.resolve(new Response(JSON.stringify(body))));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('hooks', () => {
  it('useDatasets reads /api/datasets', async () => {
    const fetch = respond([]);
    const { result } = renderHook(() => useDatasets(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledWith('/api/datasets', expect.anything());
  });

  it('useCompounds encodes the dataset ID and names the side', async () => {
    const fetch = respond([]);
    const { result } = renderHook(() => useCompounds('a/b', 'products'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledWith(
      '/api/datasets/a%2Fb/compounds?side=products',
      expect.anything(),
    );
  });

  it('useDataset encodes the dataset ID', async () => {
    const fetch = respond({});
    const { result } = renderHook(() => useDataset('a/b'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledWith('/api/datasets/a%2Fb', expect.anything());
  });

  it('useReaction encodes the reaction ID', async () => {
    const fetch = respond({});
    const { result } = renderHook(() => useReaction('a/b'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledWith('/api/reactions/a%2Fb', expect.anything());
  });

  it('useReactions repeats the id parameter in the order given', async () => {
    const fetch = respond([]);
    const { result } = renderHook(() => useReactions(['ord-b', 'ord-a']), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledWith(
      '/api/reactions?id=ord-b&id=ord-a',
      expect.anything(),
    );
  });

  it('useReactions asks for nothing when given no IDs', () => {
    const fetch = respond([]);
    const { result } = renderHook(() => useReactions([]), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('useReactions refuses more IDs than one request may carry, without asking', async () => {
    const fetch = respond([]);
    const ids = Array.from(
      { length: REACTIONS_PER_REQUEST + 1 },
      (_, index) => `ord-${index}`,
    );
    const { result } = renderHook(() => useReactions(ids), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(RangeError);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('useSearch posts the query, and waits for one', async () => {
    const fetch = respond({ kind: 'reactions', reaction_ids: [], truncated: false });
    const { result, rerender } = renderHook(({ query }) => useSearch(query), {
      wrapper,
      initialProps: { query: null as { limit: number } | null },
    });
    expect(fetch).not.toHaveBeenCalled();
    rerender({ query: { limit: 5 } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledWith(
      '/api/search',
      expect.objectContaining({ body: '{"query":{"limit":5}}' }),
    );
  });

  it('useAsk posts the question, and waits for one', async () => {
    const fetch = respond({
      query: {},
      text: 'None.',
      result: { kind: 'reactions', reaction_ids: [], truncated: false },
    });
    const { result, rerender } = renderHook(({ question }) => useAsk(question), {
      wrapper,
      initialProps: { question: null as string | null },
    });
    expect(fetch).not.toHaveBeenCalled();
    rerender({ question: 'pyridine as a solvent' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledWith(
      '/api/ask',
      expect.objectContaining({ body: '{"question":"pyridine as a solvent"}' }),
    );
  });
});
