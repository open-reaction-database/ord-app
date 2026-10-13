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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadReactions } from '#api/download.ts';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('downloadReactions', () => {
  it('posts the IDs and saves the file under the server’s name', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(new Blob(['gzip']), {
        headers: {
          'Content-Disposition': 'attachment; filename="ord-search-results.pb.gz"',
        },
      }),
    );
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:viewer');
    vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockReturnValue(undefined);

    await downloadReactions(['ord-a', 'ord-b']);

    expect(fetch).toHaveBeenCalledWith(
      '/api/download',
      expect.objectContaining({ body: '{"reaction_ids":["ord-a","ord-b"]}' }),
    );
    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe('ord-search-results.pb.gz');
    expect(link.href).toBe('blob:viewer');
  });

  it('saves the file under its own name when the server gives none', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(new Blob(['gzip'])));
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:viewer');
    vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockReturnValue(undefined);

    await downloadReactions(['ord-a']);

    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe('ord-search-results.pb.gz');
  });

  it('throws the server’s error rather than saving it', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'No known reaction' }), { status: 404 }),
    );
    await expect(downloadReactions(['ord-x'])).rejects.toMatchObject({
      status: 404,
      detail: 'No known reaction',
    });
  });
});
