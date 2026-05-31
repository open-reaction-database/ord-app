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
import { describe, it, expect } from 'vitest';
import { isNoAuthEnabled } from './noAuth.constants.ts';

describe('isNoAuthEnabled', () => {
  it('is enabled only in a non-production build with the flag set to TRUE', () => {
    expect(isNoAuthEnabled({ PROD: false, VITE_E2E_NO_AUTH: 'TRUE' })).toBe(true);
  });

  it('is NEVER enabled in a production build, even with the flag set (security guard)', () => {
    expect(isNoAuthEnabled({ PROD: true, VITE_E2E_NO_AUTH: 'TRUE' })).toBe(false);
  });

  it('is disabled when the flag is absent or not exactly TRUE', () => {
    expect(isNoAuthEnabled({ PROD: false })).toBe(false);
    expect(isNoAuthEnabled({ PROD: false, VITE_E2E_NO_AUTH: 'false' })).toBe(false);
    expect(isNoAuthEnabled({ PROD: false, VITE_E2E_NO_AUTH: 'true' })).toBe(false);
  });
});
