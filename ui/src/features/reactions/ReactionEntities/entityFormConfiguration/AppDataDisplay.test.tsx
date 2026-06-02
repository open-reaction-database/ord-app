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
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { AppDataDisplay } from './AppDataDisplay.tsx';
import { AppDataType, type AppData } from 'store/entities/reactions/reactionData/reactionData.types.ts';

const appData = (data: AppData['data'], name = 'field'): AppData => ({ id: 'x', name, data }) as AppData;

describe('AppDataDisplay', () => {
  it('renders a URL value as an external link', () => {
    renderWithMantine(<AppDataDisplay appData={appData({ type: AppDataType.Url, value: 'https://example.com' })} />);
    expect(screen.getByRole('link', { name: 'https://example.com' })).toBeInTheDocument();
  });

  it('renders a text value as plain text', () => {
    renderWithMantine(<AppDataDisplay appData={appData({ type: AppDataType.Text, value: 'hello' })} />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders an uploaded file as a download link, or "No file" when empty', () => {
    const { unmount } = renderWithMantine(
      <AppDataDisplay appData={appData({ type: AppDataType.Upload, value: 'YWJj', format: 'pb' }, 'mol')} />,
    );
    expect(screen.getByRole('link', { name: 'mol.pb' })).toBeInTheDocument();
    unmount();

    renderWithMantine(
      <AppDataDisplay appData={appData({ type: AppDataType.Upload, value: '', format: 'pb' }, 'mol')} />,
    );
    expect(screen.getByText('No file')).toBeInTheDocument();
  });
});
