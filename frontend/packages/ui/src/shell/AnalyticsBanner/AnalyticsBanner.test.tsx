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
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMantine } from '#testing/renderWithMantine.tsx';
import { DEFAULT_VIEWPORT_WIDTH, setViewportWidth } from '#testing/setViewportWidth.ts';
import type * as AnalyticsModule from '#shell/analytics.ts';
import type * as BannerModule from './AnalyticsBanner.tsx';

const DEPLOYED = 'open-reaction-database.org';

describe('AnalyticsBanner', () => {
  // What the loader puts in the head, kept out of it so happy-dom does not try to load it.
  let append: MockInstance<(...nodes: Array<Node | string>) => void>;
  // Fresh copies for each test, since the analytics module keeps the page's state.
  let analytics: typeof AnalyticsModule;
  let banner: typeof BannerModule;

  beforeEach(async () => {
    append = vi.spyOn(document.head, 'append').mockImplementation(() => undefined);
    vi.resetModules();
    analytics = await import('#shell/analytics.ts');
    banner = await import('./AnalyticsBanner.tsx');
  });

  afterEach(() => {
    append.mockRestore();
    localStorage.clear();
    delete (globalThis as { dataLayer?: unknown }).dataLayer;
    setViewportWidth(DEFAULT_VIEWPORT_WIDTH);
  });

  function renderBanner() {
    return renderWithMantine(<banner.AnalyticsBanner className="placed" />);
  }

  it('shows nothing on a page with no Google tag to load', () => {
    analytics.loadAnalytics('G-TEST', 'localhost');
    renderBanner();
    expect(screen.queryByRole('region', { name: 'Analytics' })).toBeNull();
  });

  it('asks a visitor who has not chosen, and links the privacy notice', () => {
    analytics.loadAnalytics('G-TEST', DEPLOYED);
    renderBanner();
    const region = screen.getByRole('region', { name: 'Analytics' });
    expect(region).toHaveClass('placed');
    expect(region).toHaveTextContent(
      'May we use Google Analytics? It sets cookies and tells Google which pages you ' +
        'visit, so we can see how the site is used.',
    );
    expect(screen.getByRole('link', { name: 'Privacy notice' })).toHaveAttribute(
      'href',
      banner.PRIVACY_NOTICE_URL,
    );
    expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
  });

  it('loads the tag and closes on Accept', async () => {
    analytics.loadAnalytics('G-TEST', DEPLOYED);
    renderBanner();
    await userEvent.click(screen.getByRole('button', { name: 'Accept' }));
    expect(screen.queryByRole('region', { name: 'Analytics' })).toBeNull();
    expect(append).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(analytics.ANALYTICS_CHOICE_KEY)).toBe('granted');
  });

  it('loads nothing and closes on Decline', async () => {
    analytics.loadAnalytics('G-TEST', DEPLOYED);
    renderBanner();
    await userEvent.click(screen.getByRole('button', { name: 'Decline' }));
    expect(screen.queryByRole('region', { name: 'Analytics' })).toBeNull();
    expect(append).not.toHaveBeenCalled();
    expect(localStorage.getItem(analytics.ANALYTICS_CHOICE_KEY)).toBe('denied');
  });

  it('stays closed for a visitor who chose before, until they reopen it', () => {
    localStorage.setItem(analytics.ANALYTICS_CHOICE_KEY, 'denied');
    analytics.loadAnalytics('G-TEST', DEPLOYED);
    renderBanner();
    expect(screen.queryByRole('region', { name: 'Analytics' })).toBeNull();
    act(() => analytics.askAnalytics());
    expect(screen.getByRole('region', { name: 'Analytics' })).toBeInTheDocument();
  });

  it('keeps its buttons beside the text from the sm breakpoint up', () => {
    setViewportWidth(768);
    analytics.loadAnalytics('G-TEST', DEPLOYED);
    renderBanner();
    const region = screen.getByRole('region', { name: 'Analytics' });
    expect(getComputedStyle(region).flexDirection).not.toBe('column');
  });

  it('puts its buttons under the text below the sm breakpoint', () => {
    setViewportWidth(767);
    analytics.loadAnalytics('G-TEST', DEPLOYED);
    renderBanner();
    const region = screen.getByRole('region', { name: 'Analytics' });
    expect(getComputedStyle(region).flexDirection).toBe('column');
  });
});
