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

// The hosts a page is served from on this machine: a dev server, a preview, an
// end-to-end run, a local container.
const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])$|\.localhost$/;

/**
 * Loads Google Analytics for a measurement ID, unless the page is served locally.
 *
 * @param measurementId - The Google tag ID, such as `G-REEDLYB0ZJ`.
 * @param hostname - The host the page is served from; the page's own by default.
 */
export function loadAnalytics(
  measurementId: string,
  hostname: string = globalThis.location.hostname,
): void {
  if (LOCAL_HOST.test(hostname)) {
    return;
  }
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.append(tag);
  const page = globalThis as unknown as { dataLayer?: Array<unknown> };
  const dataLayer = (page.dataLayer ??= []);
  // gtag.js reads a command only as an Arguments object, and ignores one pushed as an array.
  function gtag(..._command: Array<unknown>) {
    // eslint-disable-next-line prefer-rest-params -- gtag.js needs the Arguments object
    dataLayer.push(arguments); // NOSONAR: gtag.js needs the Arguments object
  }
  gtag('js', new Date());
  gtag('config', measurementId);
}
