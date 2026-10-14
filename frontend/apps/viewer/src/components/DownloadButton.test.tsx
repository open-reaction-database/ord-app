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
import userEvent from '@testing-library/user-event';
import { renderAt } from '#test/render.tsx';
import { DownloadButton } from '#components/DownloadButton.tsx';
import { downloadReactions } from '#api/download.ts';

vi.mock('#api/download.ts', () => ({ downloadReactions: vi.fn() }));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DownloadButton', () => {
  it('downloads the reactions it is given', async () => {
    vi.mocked(downloadReactions).mockResolvedValue(undefined);
    const user = userEvent.setup();
    const { getByRole } = renderAt(
      '/',
      <DownloadButton reactionIds={['ord-a', 'ord-b']} />,
    );
    await user.click(getByRole('button', { name: 'Download' }));
    expect(downloadReactions).toHaveBeenCalledWith(['ord-a', 'ord-b']);
  });

  it('says why a download failed', async () => {
    vi.mocked(downloadReactions).mockRejectedValue(new TypeError('Failed to fetch'));
    const user = userEvent.setup();
    const { getByRole, findByText } = renderAt(
      '/',
      <DownloadButton reactionIds={['ord-a']} />,
    );
    await user.click(getByRole('button', { name: 'Download' }));
    expect(
      await findByText('The viewer could not reach its server.'),
    ).toBeInTheDocument();
  });

  it('is disabled with nothing to download', () => {
    const { getByRole } = renderAt('/', <DownloadButton reactionIds={[]} />);
    expect(getByRole('button', { name: 'Download' })).toBeDisabled();
  });
});
