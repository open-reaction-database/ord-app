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
import { useCallback, useMemo, useState } from 'react';
import { REACTIONS_PER_REQUEST } from '#api/hooks.ts';

const PREFIX = 'viewer-selection:';

function read(key: string): Array<string> {
  try {
    const stored = sessionStorage.getItem(PREFIX + key);
    const parsed: unknown = stored === null ? [] : JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function write(key: string, ids: ReadonlyArray<string>): void {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(ids));
  } catch {
    // Storage can be full or blocked; the selection then lasts only as long as the page.
  }
}

/**
 * The reactions picked from one search's results, kept for the tab's session under the
 * search's URL, so Back returns to them. A set holds at most 100, one request's worth.
 */
export function useSelection(key: string) {
  const [state, setState] = useState(() => ({ key, ids: read(key) }));
  // A new search reads its own selection.
  const ids = state.key === key ? state.ids : read(key);
  if (state.key !== key) {
    setState({ key, ids });
  }
  const save = useCallback(
    (next: Array<string>) => {
      write(key, next);
      setState({ key, ids: next });
    },
    [key],
  );
  return useMemo(
    () => ({
      selected: ids as ReadonlyArray<string>,
      isSelected: (id: string) => ids.includes(id),
      canSelect: (id: string) => ids.includes(id) || ids.length < REACTIONS_PER_REQUEST,
      toggle: (id: string) => {
        if (ids.includes(id)) {
          save(ids.filter(selected => selected !== id));
        } else if (ids.length < REACTIONS_PER_REQUEST) {
          save([...ids, id]);
        }
      },
      clear: () => save([]),
    }),
    [ids, save],
  );
}
