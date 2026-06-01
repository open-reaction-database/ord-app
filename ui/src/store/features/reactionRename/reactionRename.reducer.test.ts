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
import { reactionRenameReducer } from './reactionRename.reducer.ts';
import { setReactionRenameOpenedAction } from './reactionRename.actions.ts';
import { renameReactionActions } from 'store/entities/reactions/reactions.actions.ts';
import type { RenameReactionPayload } from 'store/entities/reactions/reactions.types.ts';

describe('reactionRenameReducer', () => {
  it('starts closed', () => {
    expect(reactionRenameReducer(undefined, { type: '@@INIT' })).toBe(false);
  });

  it('follows the open action', () => {
    expect(reactionRenameReducer(false, setReactionRenameOpenedAction(true))).toBe(true);
    expect(reactionRenameReducer(true, setReactionRenameOpenedAction(false))).toBe(false);
  });

  it('closes once a rename succeeds', () => {
    expect(reactionRenameReducer(true, renameReactionActions.success({} as RenameReactionPayload))).toBe(false);
  });
});
