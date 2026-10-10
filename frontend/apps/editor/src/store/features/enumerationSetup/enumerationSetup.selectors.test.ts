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
import { selectIsEnumerationSetupOpened } from './enumerationSetup.selectors.ts';
import type { AppState } from 'store/configureAppStore.ts';

const buildState = (isEnumerationSetupOpened: boolean): AppState =>
  ({
    features: { enumerationSetup: { isEnumerationSetupOpened } },
  }) as unknown as AppState;

describe('selectIsEnumerationSetupOpened', () => {
  it('reads the open flag from the slice', () => {
    expect(selectIsEnumerationSetupOpened(buildState(true))).toBe(true);
    expect(selectIsEnumerationSetupOpened(buildState(false))).toBe(false);
  });
});
