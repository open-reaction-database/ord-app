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
import { useSyncExternalStore } from 'react';

// The hosts a page is served from on this machine or its network: a dev server, a
// preview, an end-to-end run, a local container, the same server opened from a phone. A
// URL's hostname writes an IPv4 address as four decimal octets, which these patterns
// read.
const LOCAL_HOSTS = [
  /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/,
  /\.(localhost|local)$/,
  /^10(\.\d{1,3}){3}$/,
  /^172\.(1[6-9]|2\d|3[01])(\.\d{1,3}){2}$/,
  /^192\.168(\.\d{1,3}){2}$/,
];

/** The local storage key that holds the visitor's choice. */
export const ANALYTICS_CHOICE_KEY = 'ord-analytics';

/** The visitor's answer to the banner, in Google consent mode's terms. */
export type AnalyticsChoice = 'granted' | 'denied';

export interface AnalyticsState {
  /** Whether the page has a Google tag to load: one was named, on a host that is not local. */
  available: boolean;
  /** The visitor's choice, or none before they make one. */
  choice?: AnalyticsChoice;
  /** Whether the banner is showing, asking for a choice. */
  asking: boolean;
}

interface Tag {
  measurementId: string;
  hostname: string;
  /** Whether gtag.js has been added to the page. */
  loaded: boolean;
}

let tag: Tag | undefined;
let state: AnalyticsState = { available: false, asking: false };
const listeners = new Set<() => void>();

function setState(next: AnalyticsState) {
  state = next;
  for (const listener of listeners) {
    listener();
  }
}

function readChoice(): AnalyticsChoice | undefined {
  try {
    const value = globalThis.localStorage.getItem(ANALYTICS_CHOICE_KEY);
    return value === 'granted' || value === 'denied' ? value : undefined;
  } catch {
    // Storage the browser blocks holds no choice, so the banner asks.
    return undefined;
  }
}

function writeChoice(choice: AnalyticsChoice) {
  try {
    globalThis.localStorage.setItem(ANALYTICS_CHOICE_KEY, choice);
  } catch {
    // Storage the browser blocks keeps the choice for this page only.
  }
}

// gtag.js reads a command only as an Arguments object, and ignores one pushed as an array.
function gtag(..._command: Array<unknown>) {
  const page = globalThis as unknown as { dataLayer?: Array<unknown> };
  // eslint-disable-next-line prefer-rest-params -- gtag.js needs the Arguments object
  (page.dataLayer ??= []).push(arguments); // NOSONAR: gtag.js needs the Arguments object
}

/** Sets Google's opt-out flag for a measurement ID, which gtag.js reads before each hit. */
function setDisabled(measurementId: string, disabled: boolean) {
  (globalThis as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] =
    disabled;
}

/**
 * Deletes the cookies gtag.js keeps for a measurement ID: `_ga`, and `_ga_` with the ID's
 * suffix. It writes them on the widest domain the host allows, so each of the host's
 * parent domains is cleared too.
 */
function deleteCookies({ measurementId, hostname }: Tag) {
  const names = ['_ga', `_ga_${measurementId.replace(/^G-/, '')}`];
  const labels = hostname.split('.');
  const domains = labels.slice(0, -1).map((_, start) => labels.slice(start).join('.'));
  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; Path=/`;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}`;
    }
  }
}

/**
 * Adds gtag.js to the page under consent mode: storage denied by default, then analytics
 * storage granted, with the advertising signals left denied.
 */
function addTag(current: Tag) {
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
  gtag('consent', 'update', { analytics_storage: 'granted' });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${current.measurementId}`;
  document.head.append(script);
  gtag('js', new Date());
  gtag('config', current.measurementId);
  current.loaded = true;
}

function grant(current: Tag) {
  setDisabled(current.measurementId, false);
  if (current.loaded) {
    gtag('consent', 'update', { analytics_storage: 'granted' });
  } else {
    addTag(current);
  }
}

function deny(current: Tag) {
  setDisabled(current.measurementId, true);
  if (current.loaded) {
    gtag('consent', 'update', { analytics_storage: 'denied' });
  }
  deleteCookies(current);
}

/**
 * Names the page's Google tag, such as `G-REEDLYB0ZJ`, and loads it if the visitor has
 * accepted analytics; until they choose, the banner asks. A page served locally, from
 * `hostname` (the page's own host unless a caller names another), loads nothing and asks
 * nothing.
 */
export function loadAnalytics(
  measurementId: string,
  hostname: string = globalThis.location.hostname,
): void {
  if (LOCAL_HOSTS.some(pattern => pattern.test(hostname))) {
    return;
  }
  tag = { measurementId, hostname, loaded: false };
  const choice = readChoice();
  setState({ available: true, choice, asking: choice === undefined });
  if (choice === 'granted') {
    addTag(tag);
  }
}

/** Records the visitor's choice, closes the banner, and loads or stops the Google tag. */
export function chooseAnalytics(choice: AnalyticsChoice): void {
  if (tag === undefined) {
    return;
  }
  writeChoice(choice);
  if (choice === 'granted') {
    grant(tag);
  } else {
    deny(tag);
  }
  setState({ ...state, choice, asking: false });
}

/** Shows the banner again, so the visitor can change their choice. */
export function askAnalytics(): void {
  if (tag !== undefined) {
    setState({ ...state, asking: true });
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The page's analytics: whether there is a tag to load, the choice, and the banner. */
export function useAnalytics(): AnalyticsState {
  return useSyncExternalStore(subscribe, () => state);
}
