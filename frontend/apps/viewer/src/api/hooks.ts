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
import { useQuery } from '@tanstack/react-query';
import { getJson, postJson } from '#api/client.ts';
import type {
  AskRequest,
  AskResponse,
  CompoundCount,
  CompoundSide,
  DatasetSummary,
  NewestDataset,
  Query,
  ReactionRecord,
  SearchRequest,
  SearchResult,
} from '#api/types.ts';

/** The most IDs one GET /api/reactions carries, the backend's bound. */
export const REACTIONS_PER_REQUEST = 100;

function datasetPath(datasetId: string): string {
  return `/api/datasets/${encodeURIComponent(datasetId)}`;
}

export function useDatasets() {
  return useQuery({
    queryKey: ['datasets'],
    queryFn: ({ signal }) =>
      getJson<Array<DatasetSummary>>('/api/datasets', undefined, signal),
  });
}

/** The most recently submitted dataset, or null when no record holds a change. */
export function useNewestDataset() {
  return useQuery({
    queryKey: ['newest-dataset'],
    queryFn: ({ signal }) =>
      getJson<NewestDataset | null>('/api/datasets/newest', undefined, signal),
  });
}

export function useDataset(datasetId: string) {
  return useQuery({
    queryKey: ['dataset', datasetId],
    queryFn: ({ signal }) =>
      getJson<DatasetSummary>(datasetPath(datasetId), undefined, signal),
  });
}

/** The dataset's 30 most frequent compounds on one side, by occurrences. */
export function useCompounds(datasetId: string, side: CompoundSide) {
  return useQuery({
    queryKey: ['compounds', datasetId, side],
    queryFn: ({ signal }) =>
      getJson<Array<CompoundCount>>(
        `${datasetPath(datasetId)}/compounds`,
        new URLSearchParams({ side }),
        signal,
      ),
  });
}

/** The known reactions among these IDs, once each, in the order given; at most 100. */
export function useReactions(reactionIds: ReadonlyArray<string>) {
  return useQuery({
    queryKey: ['reactions', reactionIds],
    queryFn: ({ signal }) => {
      if (reactionIds.length > REACTIONS_PER_REQUEST) {
        throw new RangeError(
          `${reactionIds.length} reaction IDs; one request takes at most ${REACTIONS_PER_REQUEST}`,
        );
      }
      const params = new URLSearchParams(
        reactionIds.map(reactionId => ['id', reactionId]),
      );
      return getJson<Array<ReactionRecord>>('/api/reactions', params, signal);
    },
    enabled: reactionIds.length > 0,
  });
}

export function useReaction(reactionId: string) {
  return useQuery({
    queryKey: ['reaction', reactionId],
    queryFn: ({ signal }) =>
      getJson<ReactionRecord>(
        `/api/reactions/${encodeURIComponent(reactionId)}`,
        undefined,
        signal,
      ),
  });
}

/** Runs the query, or nothing while it is null. */
export function useSearch(query: Query | null) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: ({ signal }) =>
      postJson<SearchResult>('/api/search', { query } as SearchRequest, signal),
    enabled: query !== null,
  });
}

/** Asks the question, or nothing while it is null. */
export function useAsk(question: string | null) {
  return useQuery({
    queryKey: ['ask', question],
    queryFn: ({ signal }) =>
      postJson<AskResponse>('/api/ask', { question } as AskRequest, signal),
    enabled: question !== null,
  });
}
