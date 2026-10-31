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
import { act, renderHook } from '@testing-library/react';
import type * as AnalyticsModule from './analytics.ts';

type Analytics = typeof AnalyticsModule;

const appWindow = globalThis as unknown as {
  dataLayer?: Array<unknown>;
} & Record<string, unknown>;

const DEPLOYED = 'open-reaction-database.org';

// Addresses joined from their octets: hostnames to classify, never hosts to connect to,
// which is what an address written as a literal is taken for.
function address(...octets: Array<number>): string {
  return octets.join('.');
}

/** The commands the page handed gtag.js, each as the arguments it was called with. */
function commands(): Array<Array<unknown>> {
  return (appWindow.dataLayer ?? []).map(command => [...(command as IArguments)]);
}

const LOADED = [
  [
    'consent',
    'default',
    {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    },
  ],
  ['consent', 'update', { analytics_storage: 'granted' }],
  ['js', expect.any(Date)],
  ['config', 'G-TEST'],
];

describe('analytics', () => {
  // What the loader puts in the head, kept out of it so happy-dom does not try to load it.
  let append: MockInstance<(...nodes: Array<Node | string>) => void>;
  // A fresh copy of the module for each test, since it keeps the page's state.
  let analytics: Analytics;

  beforeEach(async () => {
    append = vi.spyOn(document.head, 'append').mockImplementation(() => undefined);
    vi.resetModules();
    analytics = await import('./analytics.ts');
  });

  afterEach(() => {
    append.mockRestore();
    vi.restoreAllMocks();
    localStorage.clear();
    delete appWindow.dataLayer;
    delete appWindow['ga-disable-G-TEST'];
  });

  it.each([
    'localhost',
    '127.0.0.1',
    '[::1]',
    '0.0.0.0',
    'viewer.localhost',
    'workstation.local',
    address(10, 0, 0, 1),
    address(10, 255, 255, 255),
    address(172, 16, 0, 1),
    address(172, 24, 8, 9),
    address(172, 31, 255, 255),
    address(192, 168, 0, 1),
    address(192, 168, 255, 255),
  ])('loads nothing and asks nothing from %s', hostname => {
    localStorage.setItem(analytics.ANALYTICS_CHOICE_KEY, 'granted');
    analytics.loadAnalytics('G-TEST', hostname);
    analytics.askAnalytics();
    analytics.chooseAnalytics('granted');
    const { result } = renderHook(() => analytics.useAnalytics());
    expect(result.current).toEqual({ available: false, asking: false });
    expect(append).not.toHaveBeenCalled();
    expect(appWindow.dataLayer).toBeUndefined();
  });

  it.each([
    'open-reaction-database.org',
    'localhost.example.org',
    'mylocalhost',
    'local.example.org',
    'mylocal',
    'shop.localbank.com',
    address(127, 0, 0, 10),
    address(0, 0, 0, 1),
    address(11, 0, 0, 1),
    address(110, 0, 0, 1),
    `${address(10, 0, 0, 1)}.example.org`,
    address(172, 15, 255, 255),
    address(172, 32, 0, 1),
    address(172, 160, 0, 1),
    `${address(172, 16, 0, 1)}.example.org`,
    address(192, 169, 0, 1),
    address(1192, 168, 0, 1),
    `${address(192, 168, 0, 1)}.example.org`,
  ])('asks before loading gtag.js from %s', hostname => {
    analytics.loadAnalytics('G-TEST', hostname);
    expect(append).not.toHaveBeenCalled();
    expect(appWindow.dataLayer).toBeUndefined();
  });

  it('loads gtag.js under consent mode once the visitor accepts', () => {
    analytics.loadAnalytics('G-TEST', DEPLOYED);
    analytics.chooseAnalytics('granted');
    expect(append).toHaveBeenCalledTimes(1);
    const [tag] = append.mock.calls[0] as [HTMLScriptElement];
    expect(tag.src).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST');
    expect(tag.async).toBe(true);
    // gtag.js reads a command only as an Arguments object; an array it ignores.
    expect(
      (appWindow.dataLayer ?? []).map(command =>
        Object.prototype.toString.call(command),
      ),
    ).toEqual(Array(LOADED.length).fill('[object Arguments]'));
    expect(commands()).toEqual(LOADED);
    expect(localStorage.getItem(analytics.ANALYTICS_CHOICE_KEY)).toBe('granted');
  });

  it('loads gtag.js at once for a visitor who accepted before', () => {
    localStorage.setItem(analytics.ANALYTICS_CHOICE_KEY, 'granted');
    analytics.loadAnalytics('G-TEST', DEPLOYED);
    expect(append).toHaveBeenCalledTimes(1);
    expect(commands()).toEqual(LOADED);
  });

  it('loads nothing once the visitor declines, or for one who declined before', async () => {
    analytics.loadAnalytics('G-TEST', DEPLOYED);
    analytics.chooseAnalytics('denied');
    expect(localStorage.getItem(analytics.ANALYTICS_CHOICE_KEY)).toBe('denied');
    expect(appWindow['ga-disable-G-TEST']).toBe(true);
    vi.resetModules();
    const next: Analytics = await import('./analytics.ts');
    next.loadAnalytics('G-TEST', DEPLOYED);
    expect(append).not.toHaveBeenCalled();
    expect(appWindow.dataLayer).toBeUndefined();
  });

  it('asks until the visitor chooses, and again when they reopen the banner', () => {
    const { result } = renderHook(() => analytics.useAnalytics());
    expect(result.current).toEqual({ available: false, asking: false });
    act(() => analytics.loadAnalytics('G-TEST', DEPLOYED));
    expect(result.current).toEqual({
      available: true,
      choice: undefined,
      asking: true,
    });
    act(() => analytics.chooseAnalytics('denied'));
    expect(result.current).toEqual({
      available: true,
      choice: 'denied',
      asking: false,
    });
    act(() => analytics.askAnalytics());
    expect(result.current).toEqual({ available: true, choice: 'denied', asking: true });
  });

  it('shows no banner to a visitor who chose before', () => {
    localStorage.setItem(analytics.ANALYTICS_CHOICE_KEY, 'denied');
    analytics.loadAnalytics('G-TEST', DEPLOYED);
    const { result } = renderHook(() => analytics.useAnalytics());
    expect(result.current).toEqual({
      available: true,
      choice: 'denied',
      asking: false,
    });
  });

  it('ignores a stored value that is not a choice', () => {
    localStorage.setItem(analytics.ANALYTICS_CHOICE_KEY, 'yes');
    analytics.loadAnalytics('G-TEST', DEPLOYED);
    const { result } = renderHook(() => analytics.useAnalytics());
    expect(result.current).toEqual({
      available: true,
      choice: undefined,
      asking: true,
    });
    expect(append).not.toHaveBeenCalled();
  });

  it('stops the tag it loaded when the visitor declines, and deletes its cookies', () => {
    const cookie = vi.spyOn(document, 'cookie', 'set');
    localStorage.setItem(analytics.ANALYTICS_CHOICE_KEY, 'granted');
    analytics.loadAnalytics('G-TEST', `app.${DEPLOYED}`);
    analytics.chooseAnalytics('denied');
    expect(appWindow['ga-disable-G-TEST']).toBe(true);
    expect(commands().at(-1)).toEqual([
      'consent',
      'update',
      { analytics_storage: 'denied' },
    ]);
    const expired = 'Max-Age=0; Path=/';
    expect(cookie.mock.calls.map(([value]) => value)).toEqual([
      `_ga=; ${expired}`,
      `_ga=; ${expired}; Domain=app.${DEPLOYED}`,
      `_ga=; ${expired}; Domain=${DEPLOYED}`,
      `_ga_TEST=; ${expired}`,
      `_ga_TEST=; ${expired}; Domain=app.${DEPLOYED}`,
      `_ga_TEST=; ${expired}; Domain=${DEPLOYED}`,
    ]);
  });

  it('deletes the cookies a page on this host set', () => {
    document.cookie = '_ga=GA1.1.1; Path=/';
    document.cookie = '_ga_TEST=GS1.1.1; Path=/';
    document.cookie = 'other=1; Path=/';
    analytics.loadAnalytics('G-TEST', DEPLOYED);
    analytics.chooseAnalytics('denied');
    expect(document.cookie).toBe('other=1');
    document.cookie = 'other=; Max-Age=0; Path=/';
  });

  it('starts the tag it stopped again when the visitor accepts', () => {
    localStorage.setItem(analytics.ANALYTICS_CHOICE_KEY, 'granted');
    analytics.loadAnalytics('G-TEST', DEPLOYED);
    analytics.chooseAnalytics('denied');
    analytics.chooseAnalytics('granted');
    expect(append).toHaveBeenCalledTimes(1);
    expect(appWindow['ga-disable-G-TEST']).toBe(false);
    expect(commands().at(-1)).toEqual([
      'consent',
      'update',
      { analytics_storage: 'granted' },
    ]);
  });

  it('keeps commands queued before it loads', () => {
    appWindow.dataLayer = ['queued'];
    localStorage.setItem(analytics.ANALYTICS_CHOICE_KEY, 'granted');
    analytics.loadAnalytics('G-TEST', DEPLOYED);
    expect(appWindow.dataLayer).toHaveLength(LOADED.length + 1);
    expect(appWindow.dataLayer[0]).toBe('queued');
  });

  it('reads the page’s own host by default', () => {
    // Vitest serves the page from localhost.
    expect(globalThis.location.hostname).toBe('localhost');
    localStorage.setItem(analytics.ANALYTICS_CHOICE_KEY, 'granted');
    analytics.loadAnalytics('G-TEST');
    expect(append).not.toHaveBeenCalled();
  });

  describe('when the browser blocks storage', () => {
    let storage: PropertyDescriptor | undefined;

    // A browser that blocks a site's storage throws on reading `localStorage` at all.
    beforeEach(() => {
      storage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        get() {
          throw new DOMException('blocked', 'SecurityError');
        },
      });
    });

    afterEach(() => {
      Object.defineProperty(globalThis, 'localStorage', storage!);
    });

    it('asks, since storage holds no choice', () => {
      analytics.loadAnalytics('G-TEST', DEPLOYED);
      const { result } = renderHook(() => analytics.useAnalytics());
      expect(result.current.asking).toBe(true);
      expect(append).not.toHaveBeenCalled();
    });

    it('acts on a choice for the page, though it cannot keep it', async () => {
      analytics.loadAnalytics('G-TEST', DEPLOYED);
      analytics.chooseAnalytics('granted');
      expect(append).toHaveBeenCalledTimes(1);
      vi.resetModules();
      const next: Analytics = await import('./analytics.ts');
      next.loadAnalytics('G-TEST', DEPLOYED);
      expect(append).toHaveBeenCalledTimes(1);
    });
  });
});
