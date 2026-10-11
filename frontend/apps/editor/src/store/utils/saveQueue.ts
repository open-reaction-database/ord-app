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
 * Returns `enqueue(key, task)`, which runs `task` once every task queued earlier for the same key
 * has settled, so saves of one record never overlap and reach the backend in order.
 */
export function createSaveQueue<Key>() {
  // The last task queued for each key, settled either way so a failure does not block the next.
  const lastByKey = new Map<Key, Promise<void>>();
  return function enqueue<T>(key: Key, task: () => Promise<T>): Promise<T> {
    const result = (lastByKey.get(key) ?? Promise.resolve()).then(task);
    const settled = result.then(
      () => undefined,
      () => undefined,
    );
    lastByKey.set(key, settled);
    void settled.then(() => {
      if (lastByKey.get(key) === settled) {
        lastByKey.delete(key);
      }
    });
    return result;
  };
}
