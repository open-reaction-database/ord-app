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
import { describe, expect, it } from 'vitest';
import { routeParam } from '#routeParams.ts';

describe('routeParam', () => {
  // wouter matches routes against the path after decodeURI, which leaves the escapes of
  // reserved characters such as / in place.
  it('decodes the escapes wouter leaves in place', () => {
    expect(routeParam('a%2Fb')).toBe('a/b');
  });

  it('leaves a parameter with no escapes as it is', () => {
    expect(routeParam('ord-0123')).toBe('ord-0123');
  });

  it('returns a parameter with a stray % as it is', () => {
    expect(routeParam('a%b')).toBe('a%b');
  });
});
