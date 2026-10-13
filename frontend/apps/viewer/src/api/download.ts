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
import { send } from '#api/client.ts';
import type { DownloadRequest } from '#api/types.ts';

const DEFAULT_FILE_NAME = 'ord-search-results.pb.gz';

function fileName(disposition: string | null): string {
  return /filename="([^"]+)"/.exec(disposition ?? '')?.[1] ?? DEFAULT_FILE_NAME;
}

/** Saves the reactions as one gzipped ord.Dataset, named as the server names it. */
export async function downloadReactions(
  reactionIds: ReadonlyArray<string>,
): Promise<void> {
  const body: DownloadRequest = { reaction_ids: [...reactionIds] };
  const response = await send('/api/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName(response.headers.get('Content-Disposition'));
  link.click();
  // The browser has taken the file once the click's task ends.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
