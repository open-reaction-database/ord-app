/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { DownloadMenu } from './DownloadMenu.tsx';

describe('DownloadMenu', () => {
  it('renders its target element', () => {
    renderWithProviders(
      <DownloadMenu
        download={() => async () => {}}
        options={[{ label: 'JSON', format: 'json' }]}
        target={<button>download</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'download' })).toBeInTheDocument();
  });

  it('dispatches the download for the chosen format', async () => {
    const thunk = vi.fn(async () => {});
    const download = vi.fn((_format: string) => thunk);
    renderWithProviders(
      <DownloadMenu
        download={download}
        options={[
          { label: 'JSON', format: 'json' },
          { label: 'Text', format: 'txtpb' },
        ]}
        target={<button>download</button>}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'download' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Text' }));

    expect(download).toHaveBeenCalledWith('txtpb');
    expect(thunk).toHaveBeenCalledTimes(1);
  });
});
