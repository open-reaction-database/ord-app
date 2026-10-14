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
import { REACTIONS_PER_REQUEST } from '#api/hooks.ts';

/**
 * The set's reactions from the URL's id parameters: once each, in the order first
 * given, and at most one request's worth, with the count of those past it.
 */
export function selectedIds(params: URLSearchParams): {
  ids: ReadonlyArray<string>;
  dropped: number;
} {
  const unique = [...new Set(params.getAll('id').filter(id => id !== ''))];
  return {
    ids: unique.slice(0, REACTIONS_PER_REQUEST),
    dropped: Math.max(0, unique.length - REACTIONS_PER_REQUEST),
  };
}
