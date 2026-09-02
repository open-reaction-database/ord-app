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

export type NameMatchSegments =
  | { kind: 'plain'; text: string }
  | { kind: 'hit'; before: string; match: string; after: string };

/**
 * Split `name` around the first case-insensitive substring match of `query`.
 * Returns plain text when there is no safe highlight (empty query, no match,
 * or Unicode case-mapping that would mis-slice).
 */
export function highlightNameMatch(name: string, query: string): NameMatchSegments {
  const safeName = typeof name === 'string' ? name : '';
  const rawQuery = typeof query === 'string' ? query : '';
  const q = rawQuery.trim();
  if (q === '') {
    return { kind: 'plain', text: safeName };
  }

  const lowerName = safeName.toLowerCase();
  const lowerQ = q.toLowerCase();
  // Bail when lowercasing changes length — slice offsets would be wrong.
  if (lowerName.length !== safeName.length || lowerQ.length !== q.length) {
    return { kind: 'plain', text: safeName };
  }

  const i = lowerName.indexOf(lowerQ);
  if (i < 0) {
    return { kind: 'plain', text: safeName };
  }

  return {
    kind: 'hit',
    before: safeName.slice(0, i),
    match: safeName.slice(i, i + q.length),
    after: safeName.slice(i + q.length),
  };
}
