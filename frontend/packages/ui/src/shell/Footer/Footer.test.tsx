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
import { renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMantine } from '#testing/renderWithMantine.tsx';
import { DEFAULT_VIEWPORT_WIDTH, setViewportWidth } from '#testing/setViewportWidth.ts';
import { Footer } from './Footer.tsx';

const SHA = '0123456789abcdef0123456789abcdef01234567';

function itemsWrap() {
  const items = screen.getByText(/© Copyright/).parentElement as HTMLElement;
  return getComputedStyle(items).flexWrap === 'wrap';
}

describe('Footer', () => {
  it('renders the dated copyright line and external links', () => {
    renderWithMantine(<Footer />);
    expect(
      screen.getByText(/© Copyright \d{4} Open Reaction Database/),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(2);
  });

  it('links the commit it is given, abbreviated, to its page on GitHub', () => {
    renderWithMantine(<Footer commit={SHA} />);
    const link = screen.getByRole('link', { name: SHA.slice(0, 7) });
    expect(link).toHaveAttribute(
      'href',
      `https://github.com/open-reaction-database/ord-app/commit/${SHA}`,
    );
    expect(link.parentElement).toHaveTextContent(`Commit ${SHA.slice(0, 7)}`);
  });

  it('marks a commit built with changes as dirty, and links the commit they were made on', () => {
    renderWithMantine(<Footer commit={`${SHA}-dirty`} />);
    const link = screen.getByRole('link', { name: `${SHA.slice(0, 7)}-dirty` });
    expect(link).toHaveAttribute(
      'href',
      `https://github.com/open-reaction-database/ord-app/commit/${SHA}`,
    );
  });

  it.each([undefined, '', 'unknown', SHA.slice(0, 7)])(
    'shows no commit for %j',
    commit => {
      renderWithMantine(<Footer commit={commit} />);
      expect(screen.queryByText(/Commit/)).not.toBeInTheDocument();
    },
  );

  it('links the support address', () => {
    renderWithMantine(<Footer />);
    const link = screen.getByRole('link', { name: 'help@open-reaction-database.org' });
    expect(link).toHaveAttribute('href', 'mailto:help@open-reaction-database.org');
  });

  it('offers no analytics settings on a page with no Google tag to load', () => {
    renderWithMantine(<Footer />);
    expect(screen.queryByRole('button', { name: 'Analytics settings' })).toBeNull();
  });

  describe('on a page with a Google tag to load', () => {
    afterEach(() => {
      localStorage.clear();
    });

    it('reopens the analytics banner from its settings button', async () => {
      // Fresh copies, since the analytics module keeps the page's state.
      vi.resetModules();
      const analytics = await import('#shell/analytics.ts');
      const fresh = await import('./Footer.tsx');
      localStorage.setItem(analytics.ANALYTICS_CHOICE_KEY, 'denied');
      analytics.loadAnalytics('G-TEST', 'open-reaction-database.org');
      const { result } = renderHook(() => analytics.useAnalytics());
      expect(result.current.asking).toBe(false);
      renderWithMantine(<fresh.Footer />);
      await userEvent.click(screen.getByRole('button', { name: 'Analytics settings' }));
      expect(result.current.asking).toBe(true);
    });
  });

  describe('at different widths', () => {
    afterEach(() => {
      setViewportWidth(DEFAULT_VIEWPORT_WIDTH);
    });

    it('keeps its items on one line from the sm breakpoint up', () => {
      setViewportWidth(768);
      renderWithMantine(<Footer />);
      expect(itemsWrap()).toBe(false);
    });

    it('wraps its items onto more lines below the sm breakpoint', () => {
      setViewportWidth(767);
      renderWithMantine(<Footer />);
      expect(itemsWrap()).toBe(true);
    });
  });
});
