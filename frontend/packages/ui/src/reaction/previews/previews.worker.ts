/*
 * Copyright 2024 Open Reaction Database Project Authors
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
import { initIndigo, renderSvg, waitForIndigo } from './indigo.ts';

/** Molblocks to render, keyed by the caller's IDs, with the ID that pairs the reply to it. */
export interface PreviewsRequest {
  id: number;
  molblocksById: PreviewsById;
  size: number;
}

/** The base64 SVGs for one request, keyed as requested, or why none could be rendered. */
export type PreviewsReply =
  | { id: number; svgsById: PreviewsById }
  | { id: number; error: string };

initIndigo();

function isRequest(data: unknown): data is PreviewsRequest {
  // typeof null === 'object', so null needs its own check.
  return (
    typeof data === 'object' && data !== null && 'id' in data && 'molblocksById' in data
  );
}

onmessage = (event: MessageEvent<unknown>) => {
  if (!isRequest(event.data)) {
    return;
  }
  const { id, molblocksById, size } = event.data;
  waitForIndigo().then(
    () => {
      const svgsById = Object.fromEntries(
        Object.entries(molblocksById).map(([key, molblock]) => [
          key,
          renderSvg(molblock, size),
        ]),
      );
      postMessage({ id, svgsById } satisfies PreviewsReply);
    },
    (error: unknown) => {
      postMessage({ id, error: String(error) } satisfies PreviewsReply);
    },
  );
};
