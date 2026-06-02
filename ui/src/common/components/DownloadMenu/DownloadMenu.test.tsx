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
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { DownloadMenu } from './DownloadMenu.tsx';

describe('DownloadMenu', () => {
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
});
