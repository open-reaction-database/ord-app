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

/**
 * Client-side filter of template ids by case-insensitive substring match on `name`.
 * Whitespace-only queries return `order` unchanged. Ids with a missing or non-string
 * name are skipped (do not appear in the filtered result).
 *
 * `templatesById` is typically `reactionsById` (templates + datasets); only string `name`
 * values participate in the match.
 */
export function filterTemplatesByName(
  order: string[],
  templatesById: Record<string, unknown>,
  query: string,
): string[] {
  const q = query.trim().toLowerCase();
  if (q === '') {
    return order;
  }

  return order.filter(id => {
    const entry = templatesById[id];
    const name =
      entry && typeof entry === 'object' && 'name' in entry
        ? (entry as { name?: unknown }).name
        : undefined;
    if (typeof name !== 'string') {
      return false;
    }
    return name.toLowerCase().includes(q);
  });
}
