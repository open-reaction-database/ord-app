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
import { selectIsVariablesSidebarOpened } from './variablesSidebar.selectors.ts';
import type { AppState } from 'store/configureAppStore.ts';

const buildState = (isVariablesSidebarOpened: boolean): AppState =>
  ({ features: { variablesSidebar: { isVariablesSidebarOpened } } }) as unknown as AppState;

describe('selectIsVariablesSidebarOpened', () => {
  it('reads the open flag from the slice', () => {
    expect(selectIsVariablesSidebarOpened(buildState(true))).toBe(true);
    expect(selectIsVariablesSidebarOpened(buildState(false))).toBe(false);
  });
});
