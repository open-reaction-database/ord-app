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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { downloadFileFromUrl } from 'store/utils/downloadFile.thunks.ts';
import { DownloadMenu } from './DownloadMenu.tsx';

vi.mock('store/utils/downloadFile.thunks.ts', () => ({
  downloadFileFromUrl: vi.fn((_url: string, _fileName?: string) => async () => {}),
}));

const chooseJson = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'download' }));
  await userEvent.click(await screen.findByRole('menuitem', { name: 'JSON' }));
};

describe('DownloadMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders its target element', () => {
    renderWithProviders(
      <DownloadMenu
        url="/datasets/1/download"
        options={[{ label: 'JSON', format: 'json' }]}
        target={<button>download</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'download' })).toBeInTheDocument();
  });

  it('names the file after the given name and the chosen format', async () => {
    renderWithProviders(
      <DownloadMenu
        url="/datasets/1/download"
        options={[{ label: 'JSON', format: 'json' }]}
        target={<button>download</button>}
        fileName="C–N coupling"
      />,
    );

    await chooseJson();

    expect(downloadFileFromUrl).toHaveBeenCalledWith(
      '/datasets/1/download?file_format=json',
      'C–N coupling.json',
    );
  });

  it('passes no file name when given none', async () => {
    renderWithProviders(
      <DownloadMenu
        url="/datasets/1/download"
        options={[{ label: 'JSON', format: 'json' }]}
        target={<button>download</button>}
      />,
    );

    await chooseJson();

    expect(downloadFileFromUrl).toHaveBeenCalledWith(
      '/datasets/1/download?file_format=json',
      undefined,
    );
  });
});
