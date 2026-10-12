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
import { describe, it, expect, vi } from 'vitest';
import { within } from '@testing-library/react';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { EditorPageContainer } from './EditorPageContainer.tsx';

// The real menu reads the signed-in user from Auth0 and the store.
vi.mock('./UserMenu/UserMenu', () => ({
  default: () => <div data-testid="user-menu" />,
}));

describe('EditorPageContainer', () => {
  it('puts the user menu in the page header', () => {
    const { getByRole, getByText } = renderWithMantine(
      <EditorPageContainer breadcrumbs={[{ title: 'Datasets', path: '/datasets' }]}>
        <div>page content</div>
      </EditorPageContainer>,
    );
    expect(within(getByRole('banner')).getByTestId('user-menu')).toBeInTheDocument();
    expect(getByText('page content')).toBeInTheDocument();
  });
});
