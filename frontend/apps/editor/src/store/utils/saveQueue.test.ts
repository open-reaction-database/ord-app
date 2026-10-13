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
import { createSaveQueue, createStoreSaveQueues } from './saveQueue.ts';

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

describe('createStoreSaveQueues', () => {
  it('gives a store the same queues each time a module asks by the same name', async () => {
    // As after a hot reload, when the module that made the queues runs again.
    const store = {};
    const first = createStoreSaveQueues<number>('test-reload')(store);
    const again = createStoreSaveQueues<number>('test-reload')(store);
    const blocked = deferred<void>();
    const started: Array<string> = [];
    void first(1, () => {
      started.push('first');
      return blocked.promise;
    });
    void again(1, async () => {
      started.push('again');
    });
    await flush();
    expect(started).toEqual(['first']);
    blocked.resolve();
  });

  it.each<
    [string, () => Array<ReturnType<ReturnType<typeof createStoreSaveQueues<number>>>>]
  >([
    [
      'names in one store',
      () => {
        const store = {};
        return [
          createStoreSaveQueues<number>('test-name-a')(store),
          createStoreSaveQueues<number>('test-name-b')(store),
        ];
      },
    ],
    [
      'stores under one name',
      () => {
        const forStore = createStoreSaveQueues<number>('test-stores');
        return [forStore({}), forStore({})];
      },
    ],
  ])('keeps the queues of different %s apart', async (_label, makeQueues) => {
    const [blockedQueue, otherQueue] = makeQueues();
    const blocked = deferred<void>();
    const started: Array<string> = [];
    void blockedQueue(1, () => blocked.promise);
    void otherQueue(1, async () => {
      started.push('other');
    });
    await flush();
    expect(started).toEqual(['other']);
    blocked.resolve();
  });
});
