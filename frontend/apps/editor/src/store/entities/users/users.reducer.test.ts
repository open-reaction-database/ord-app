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
import { usersReducer } from './users.reducer.ts';
import { createUserActions } from './users.actions.ts';
import type { User } from './users.types.ts';

const user: User = {
  id: 1,
  name: 'Ada',
  email: 'ada@example.com',
  external_id: 'ext-1',
  avatar_url: 'https://example.com/a.png',
};

describe('usersReducer', () => {
  it('starts with a null self', () => {
    expect(usersReducer(undefined, { type: '@@INIT' })).toEqual({ self: null });
  });

  it('stores the authenticated user on create success', () => {
    const state = usersReducer(undefined, createUserActions.success(user));
    expect(state.self).toEqual(user);
  });

  it('ignores unrelated actions', () => {
    const seeded = usersReducer(undefined, createUserActions.success(user));
    const next = usersReducer(seeded, { type: 'other/action' });
    expect(next.self).toBe(seeded.self);
  });
});
