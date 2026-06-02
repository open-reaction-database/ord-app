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
import { ordWorkupToReaction, reactionWorkupToOrd } from './reactionWorkups.converters.ts';
import type { ReactionWorkup } from './reactionWorkups.types.ts';
import { ReactionBoolean } from '../reactionEntity/reactionEntity.types.ts';

describe('ordWorkupToReaction', () => {
  it('assigns an id and maps the scalar fields, defaulting an absent input to null', () => {
    const result = ordWorkupToReaction({ isAutomated: true, details: 'quench' });
    expect(typeof result.id).toBe('string');
    expect(result.isAutomated).toBe(ReactionBoolean.True);
    expect(result.input).toBeNull();
    expect(result.details).toBe('quench');
    expect(typeof result.type).toBe('string');
  });
});

describe('reactionWorkupToOrd', () => {
  it('maps a CUSTOM workup back to ord, preserving null sub-entities', () => {
    const workup = {
      id: 'w1',
      type: 'CUSTOM',
      duration: null,
      amount: null,
      input: null,
      temperature: null,
      stirring: null,
      keepPhase: null,
      targetPh: null,
      isAutomated: ReactionBoolean.Unspecified,
      details: 'note',
    } as unknown as ReactionWorkup;

    const result = reactionWorkupToOrd(workup);
    expect(typeof result.type).toBe('number');
    expect(result.isAutomated).toBeNull();
    expect(result.duration).toBeNull();
    expect(result.amount).toBeNull();
    expect(result.input).toBeNull();
    expect(result.details).toBe('note');
    // withoutId strips the app-only id.
    expect(result).not.toHaveProperty('id');
  });
});
