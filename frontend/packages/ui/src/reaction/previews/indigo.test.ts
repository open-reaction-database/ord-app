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
import { describe, it, expect } from 'vitest';
import { renderSvg } from './indigo.ts';

// renderSvg guards before touching the (async-loaded) wasm module, which is never
// initialized in this unit test, so both guard branches return null.
describe('renderSvg', () => {
  it('returns null for a null component', () => {
    expect(renderSvg(null)).toBeNull();
  });

  it('returns null when the indigo module has not been initialized', () => {
    expect(renderSvg('CCO')).toBeNull();
  });
});
