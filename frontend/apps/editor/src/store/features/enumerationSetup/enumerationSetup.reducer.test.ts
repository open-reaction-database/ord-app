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
import { enumerationSetupReducer } from './enumerationSetup.reducer.tsx';
import { setEnumerationSetupOpenedAction } from './enumerationSetup.actions.ts';
import { startEnumerationActions } from '../../entities/enumeration/enumeration.actions.ts';
import type { StartEnumeration } from '../../entities/enumeration/enumeration.types.ts';

describe('enumerationSetupReducer', () => {
  it('toggles the opened flag via setEnumerationSetupOpenedAction', () => {
    const opened = enumerationSetupReducer(
      undefined,
      setEnumerationSetupOpenedAction(true),
    );
    expect(opened.isEnumerationSetupOpened).toBe(true);
    const closed = enumerationSetupReducer(
      opened,
      setEnumerationSetupOpenedAction(false),
    );
    expect(closed.isEnumerationSetupOpened).toBe(false);
  });

  it('closes the setup when enumeration starts', () => {
    const opened = enumerationSetupReducer(
      undefined,
      setEnumerationSetupOpenedAction(true),
    );
    const result = enumerationSetupReducer(
      opened,
      startEnumerationActions({} as unknown as StartEnumeration),
    );
    expect(result.isEnumerationSetupOpened).toBe(false);
  });
});
