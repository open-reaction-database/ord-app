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
import type { PreviewsById } from './previews.types.ts';
import type { PreviewsReply, PreviewsRequest } from './previews.worker.ts';

const DEFAULT_SIZE = 120;

/** The part of a Worker the renderer uses. */
export interface PreviewWorker {
  postMessage(message: PreviewsRequest): void;
  terminate(): void;
  onmessage: ((event: MessageEvent<PreviewsReply>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
}

interface PendingRequest {
  resolve: (svgsById: PreviewsById) => void;
  reject: (error: Error) => void;
}

function nullsFor(molblocksById: PreviewsById): PreviewsById {
  return Object.fromEntries(Object.keys(molblocksById).map(key => [key, null]));
}

/**
 * Creates a renderer over one worker, started on first use and replaced after it fails.
 *
 * Args:
 *   createWorker: Starts the worker; called again only after the previous one failed.
 *
 * Returns:
 *   A `renderPreviews` function over that worker.
 */
export function createPreviewRenderer(createWorker: () => PreviewWorker) {
  let worker: PreviewWorker | undefined;
  let nextId = 0;
  const pending = new Map<number, PendingRequest>();

  function settle(reply: PreviewsReply) {
    const request = pending.get(reply.id);
    if (!request) {
      return;
    }
    pending.delete(reply.id);
    if ('error' in reply) {
      request.reject(new Error(reply.error));
    } else {
      request.resolve(reply.svgsById);
    }
  }

  function fail(failed: PreviewWorker, message: string) {
    for (const request of pending.values()) {
      request.reject(new Error(message));
    }
    pending.clear();
    failed.terminate();
    worker = undefined;
  }

  function getWorker(): PreviewWorker {
    if (!worker) {
      const created = createWorker();
      created.onmessage = event => settle(event.data);
      // A worker script that fails to load reports a plain Event, which has no message.
      created.onerror = event =>
        fail(created, event.message || 'The preview worker failed');
      worker = created;
    }
    return worker;
  }

  return function renderPreviews(
    molblocksById: PreviewsById,
    { size = DEFAULT_SIZE }: { size?: number } = {},
  ): Promise<PreviewsById> {
    if (Object.values(molblocksById).every(molblock => molblock === null)) {
      return Promise.resolve(nullsFor(molblocksById));
    }
    const id = nextId;
    nextId += 1;
    return new Promise((resolve, reject) => {
      // A worker that cannot be created throws here, which rejects this request.
      const target = getWorker();
      pending.set(id, { resolve, reject });
      target.postMessage({ id, molblocksById, size });
    });
  };
}

/**
 * Renders molblocks to base64 SVGs, keyed as given, in one worker shared by every caller.
 *
 * A null molblock, or one Indigo cannot render, maps to null. The returned promise rejects
 * when the worker cannot start or fails.
 */
export const renderPreviews = createPreviewRenderer(
  () =>
    new Worker(new URL('./previews.worker.ts', import.meta.url), {
      type: 'module',
    }) as PreviewWorker,
);
