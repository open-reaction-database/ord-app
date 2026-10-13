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
import { afterEach, describe, it, expect, vi } from 'vitest';
import { within } from '@testing-library/react';
import { DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';
import { theme } from '#theme/theme.ts';
import { renderWithMantine } from '#testing/renderWithMantine.tsx';
import { DEFAULT_VIEWPORT_WIDTH, setViewportWidth } from '#testing/setViewportWidth.ts';
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

  it('leaves the footer, and the room kept for it, out when a host gives null', () => {
    const withFooter = renderWithMantine(<PageContainer breadcrumbs={[]} />);
    expect(withFooter.getByRole('main').className).not.toMatch(/mainWithoutFooter/);
    withFooter.unmount();
    const { getByRole, queryByRole, queryByTestId } = renderWithMantine(
      <PageContainer
        breadcrumbs={[]}
        footer={null}
      />,
    );
    expect(queryByRole('contentinfo')).toBeNull();
    expect(queryByTestId('footer')).toBeNull();
    expect(getByRole('main').className).toMatch(/mainWithoutFooter/);
  });
});

describe('PageContainer at different widths', () => {
  afterEach(() => {
    setViewportWidth(DEFAULT_VIEWPORT_WIDTH);
  });

  function renderPage() {
    const { getByRole } = renderWithMantine(<PageContainer breadcrumbs={[]} />);
    const main = getByRole('main');
    return {
      root: getComputedStyle(main.parentElement as HTMLElement),
      main: getComputedStyle(main),
      footer: getComputedStyle(getByRole('contentinfo')),
    };
  }

  it('names the theme’s sm breakpoint in its stylesheets', () => {
    expect(mergeMantineTheme(DEFAULT_THEME, theme).breakpoints.sm).toBe('48em');
  });

  it('keeps a 48px footer, and padding clear of it, from the sm breakpoint up', () => {
    setViewportWidth(768);
    const { root, main, footer } = renderPage();
    expect(footer.height).toBe('48px');
    expect(footer.position).not.toBe('sticky');
    expect(main.paddingBottom).toBe('48px');
    expect(root.display).not.toBe('flex');
  });

  it('puts the footer in the page flow below the sm breakpoint, at its content’s height', () => {
    setViewportWidth(767);
    const { footer, main } = renderPage();
    expect(footer.height).toBe('auto');
    expect(footer.position).toBe('sticky');
    expect(main.paddingBottom).toBe('0px');
  });

  it('fills the screen above the footer with the main area below the sm breakpoint', () => {
    setViewportWidth(767);
    const { root, main } = renderPage();
    expect(root.display).toBe('flex');
    expect(root.flexDirection).toBe('column');
    expect(root.minHeight).toBe('100dvh');
    expect(main.flexGrow).toBe('1');
  });
});
