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

/**
 * Dev/test-only Auth0 bypass for local development and E2E (see #664).
 *
 * Hard-gated on a non-production build (`!PROD`) so it can NEVER activate in a production
 * bundle, regardless of the env var. Exported as a pure function so the guard is unit-testable.
 * Kept in its own (DOM-free) module so the guard can be tested without a browser environment.
 */
export const isNoAuthEnabled = (env: { PROD: boolean; VITE_E2E_NO_AUTH?: string }): boolean =>
  !env.PROD && env.VITE_E2E_NO_AUTH === 'TRUE';

export const noAuth = isNoAuthEnabled(import.meta.env);

// Gated on `noAuth` so the fallback literal is never the effective value in a production bundle.
export const e2eDevToken = noAuth ? (import.meta.env.VITE_E2E_DEV_TOKEN as string) || 'e2e-dev-token' : '';
