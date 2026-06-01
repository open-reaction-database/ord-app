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
import { selectSelf } from './users.selectors.ts';
import type { User } from './users.types.ts';
import type { AppState } from '../../configureAppStore.ts';

const buildState = (self: User | null): AppState => ({ entities: { users: { self } } }) as unknown as AppState;

describe('selectSelf', () => {
  it('returns null when no user is authenticated', () => {
    expect(selectSelf(buildState(null))).toBeNull();
  });

  it('returns the authenticated user', () => {
    const user: User = {
      id: 1,
      name: 'Ada',
      email: 'ada@example.com',
      external_id: 'ext-1',
      avatar_url: '',
    };
    expect(selectSelf(buildState(user))).toBe(user);
  });
});
