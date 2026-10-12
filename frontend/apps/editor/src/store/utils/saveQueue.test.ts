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
import { describe, expect, it } from 'vitest';
import { deferred } from 'test/deferred.ts';
import { createSaveQueue } from './saveQueue.ts';

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe('createSaveQueue', () => {
  it('runs one key’s tasks one at a time, in the order they were queued', async () => {
    const enqueue = createSaveQueue<number>();
    const first = deferred<string>();
    const started: Array<string> = [];
    const a = enqueue(1, () => {
      started.push('a');
      return first.promise;
    });
    const b = enqueue(1, async () => {
      started.push('b');
      return 'b';
    });
    await flush();
    expect(started).toEqual(['a']);
    first.resolve('a');
    await expect(a).resolves.toBe('a');
    await expect(b).resolves.toBe('b');
    expect(started).toEqual(['a', 'b']);
  });

  it('runs the next task after one fails, and rejects only the failed one', async () => {
    const enqueue = createSaveQueue<number>();
    const failed = enqueue(1, () => Promise.reject(new Error('offline')));
    const next = enqueue(1, async () => 'saved');
    await expect(failed).rejects.toThrow('offline');
    await expect(next).resolves.toBe('saved');
  });

  it('runs tasks for different keys at the same time', async () => {
    const enqueue = createSaveQueue<number>();
    const blocked = deferred<void>();
    const started: Array<number> = [];
    void enqueue(1, () => {
      started.push(1);
      return blocked.promise;
    });
    void enqueue(2, async () => {
      started.push(2);
    });
    await flush();
    expect(started).toEqual([1, 2]);
    blocked.resolve();
  });
});
