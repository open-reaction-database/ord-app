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
import { within } from '@testing-library/react';
import { renderWithMantine } from '#testing/renderWithMantine.tsx';
import { PageContainer } from './PageContainer.tsx';

// Stub the router-aware Breadcrumbs and the Footer so this test focuses on PageContainer's own
// layout (logo, header controls, badge, children).
vi.mock('#shell/Breadcrumbs/Breadcrumbs.tsx', () => ({
  Breadcrumbs: ({ items }: Readonly<{ items: Array<unknown> }>) => (
    <nav data-testid="breadcrumbs">{items.length}</nav>
  ),
}));
vi.mock('#shell/Footer/Footer.tsx', () => ({
  Footer: () => <div data-testid="footer" />,
}));

describe('PageContainer', () => {
  it('renders the logo, header controls, chrome, optional badge, and its children', () => {
    const { getByText, getByAltText, getByTestId, getByRole } = renderWithMantine(
      <PageContainer
        breadcrumbs={[{ title: 'Datasets', path: '/datasets' }]}
        badge={<span>BADGE</span>}
        headerActions={<span>menu</span>}
      >
        <div>page content</div>
      </PageContainer>,
    );
    expect(getByAltText('Open Reaction Database logo')).toBeInTheDocument();
    expect(within(getByRole('banner')).getByText('menu')).toBeInTheDocument();
    expect(getByTestId('footer')).toBeInTheDocument();
    expect(getByTestId('breadcrumbs')).toHaveTextContent('1');
    expect(getByText('BADGE')).toBeInTheDocument();
    expect(getByText('page content')).toBeInTheDocument();
  });

  it('keeps several header controls together, apart from the logo', () => {
    const { getByText, getByRole } = renderWithMantine(
      <PageContainer
        breadcrumbs={[]}
        headerActions={
          <>
            <span>help</span>
            <span>menu</span>
          </>
        }
      />,
    );
    const controls = getByText('menu').parentElement;
    expect(getByText('help').parentElement).toBe(controls);
    expect(controls).not.toBe(getByRole('banner'));
  });

  it('shows the footer a host gives instead of the default one', () => {
    const { getByText, queryByTestId } = renderWithMantine(
      <PageContainer
        breadcrumbs={[]}
        footer={<span>host footer</span>}
      />,
    );
    expect(getByText('host footer')).toBeInTheDocument();
    expect(queryByTestId('footer')).toBeNull();
  });
});
