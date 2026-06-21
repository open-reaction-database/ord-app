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
import { setupTransform } from './reactionSetup.transform.ts';
import type { ReactionSetup } from './reactionSetup.types.ts';
import { ReactionBoolean } from '../reactionEntity/reactionEntity.types.ts';

const makeSetup = (isAutomated: ReactionBoolean): ReactionSetup =>
  ({ isAutomated, automationPlatform: 'platform-x' }) as unknown as ReactionSetup;

describe('setupTransform', () => {
  it('keeps automationPlatform when the setup is automated', () => {
    expect(setupTransform(makeSetup(ReactionBoolean.True)).automationPlatform).toBe(
      'platform-x',
    );
  });

  it('clears automationPlatform when the setup is not automated', () => {
    expect(
      setupTransform(makeSetup(ReactionBoolean.False)).automationPlatform,
    ).toBeNull();
    expect(
      setupTransform(makeSetup(ReactionBoolean.Unspecified)).automationPlatform,
    ).toBeNull();
  });

  it('does not mutate the input setup', () => {
    const setup = makeSetup(ReactionBoolean.False);
    setupTransform(setup);
    expect(setup.automationPlatform).toBe('platform-x');
  });
});
