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
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { PageContainer } from './PageContainer.tsx';

// The shell's chrome pulls in the auth-aware UserMenu, the router-aware Breadcrumbs, and the Footer;
// stub them so this test focuses on PageContainer's own layout (logo, badge, children).
vi.mock('./UserMenu/UserMenu', () => ({ default: () => <div data-testid="user-menu" /> }));
vi.mock('./Breadcrumbs/Breadcrumbs', () => ({
  Breadcrumbs: ({ items }: Readonly<{ items: Array<unknown> }>) => <nav data-testid="breadcrumbs">{items.length}</nav>,
}));
vi.mock('./Footer/Footer', () => ({ Footer: () => <div data-testid="footer" /> }));

describe('PageContainer', () => {
  it('renders the logo, chrome, optional badge, and its children', () => {
    const { getByText, getByAltText, getByTestId } = renderWithMantine(
      <PageContainer
        breadcrumbs={[{ title: 'Datasets', path: '/datasets' }]}
        badge={<span>BADGE</span>}
      >
        <div>page content</div>
      </PageContainer>,
    );
    expect(getByAltText('Open Reaction Database logo')).toBeInTheDocument();
    expect(getByTestId('user-menu')).toBeInTheDocument();
    expect(getByTestId('footer')).toBeInTheDocument();
    expect(getByTestId('breadcrumbs')).toHaveTextContent('1');
    expect(getByText('BADGE')).toBeInTheDocument();
    expect(getByText('page content')).toBeInTheDocument();
  });
});
