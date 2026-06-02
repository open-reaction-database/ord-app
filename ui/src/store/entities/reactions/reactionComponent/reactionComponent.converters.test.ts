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
import { ordPreparationToReaction, reactionPreparationToOrd } from './reactionComponent.converters.ts';
import type { ReactionComponentPreparation } from './reactionComponent.types.ts';

// CompoundPreparationType: CUSTOM = 1, SYNTHESIZED = 6.
const SYNTHESIZED = 6;

describe('ordPreparationToReaction', () => {
  it('assigns an id and maps the type to its name', () => {
    const result = ordPreparationToReaction({ type: SYNTHESIZED, details: 'made in house', reactionId: 'r1' });
    expect(typeof result.id).toBe('string');
    expect(result.type).toBe('SYNTHESIZED');
    expect(result.details).toBe('made in house');
    expect(result.reactionId).toBe('r1');
  });
});

describe('reactionPreparationToOrd', () => {
  const base = { id: 'p1', details: 'd', reactionId: 'r1' };

  it('keeps reactionId only for SYNTHESIZED preparations', () => {
    const synthesized = reactionPreparationToOrd({ ...base, type: 'SYNTHESIZED' } as ReactionComponentPreparation);
    expect(synthesized.type).toBe(SYNTHESIZED);
    expect(synthesized.reactionId).toBe('r1');
  });

  it('drops reactionId for non-SYNTHESIZED preparations', () => {
    const custom = reactionPreparationToOrd({ ...base, type: 'CUSTOM' } as ReactionComponentPreparation);
    expect(custom.reactionId).toBeNull();
    expect(custom.details).toBe('d');
  });
});
