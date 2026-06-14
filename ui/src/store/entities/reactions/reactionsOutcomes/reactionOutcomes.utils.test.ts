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
import { sortOutcomesByReactionTime } from './reactionOutcomes.utils.ts';
import type { ReactionOutcome } from './reactionOutcomes.types.ts';

const outcome = (id: number, value?: number, units?: string): ReactionOutcome =>
  ({ id, reactionTime: { value, units } }) as unknown as ReactionOutcome;

const order = (outcomes: Array<ReactionOutcome>) =>
  sortOutcomesByReactionTime(outcomes).map(({ outcome, index }) => ({ id: outcome.id, index }));

describe('sortOutcomesByReactionTime (#599)', () => {
  it('orders by ascending reaction time while preserving each outcome’s stored index', () => {
    // stored order ids: 1 (2h), 2 (30min), 3 (1h)
    const result = order([outcome(1, 2, 'HOUR'), outcome(2, 30, 'MINUTE'), outcome(3, 1, 'HOUR')]);
    expect(result.map(r => r.id)).toEqual([2, 3, 1]); // 30min < 1h < 2h
    // The original stored index travels with each outcome (for the edit path).
    expect(result).toEqual([
      { id: 2, index: 1 },
      { id: 3, index: 2 },
      { id: 1, index: 0 },
    ]);
  });

  it('normalizes across units (DAY/HOUR/MINUTE/SECOND)', () => {
    const result = order([outcome(1, 1, 'DAY'), outcome(2, 90, 'MINUTE'), outcome(3, 5000, 'SECOND')]);
    // 90min = 5400s, 5000s, 1day = 86400s
    expect(result.map(r => r.id)).toEqual([3, 2, 1]);
  });

  it('keeps stored order for outcomes without a usable reaction time, after the timed ones', () => {
    const result = order([
      outcome(1), // no time
      outcome(2, 1, 'HOUR'),
      outcome(3), // no time
      outcome(4, 30, 'MINUTE'),
    ]);
    expect(result.map(r => r.id)).toEqual([4, 2, 1, 3]); // timed asc (30m, 1h), then untimed in stored order
  });

  it('preserves stored order when no outcome has a reaction time', () => {
    const result = order([outcome(3), outcome(1), outcome(2)]);
    expect(result.map(r => r.id)).toEqual([3, 1, 2]);
  });

  it('treats an unknown/unspecified unit as no usable time', () => {
    const result = order([outcome(1, 5, 'UNSPECIFIED'), outcome(2, 1, 'HOUR')]);
    expect(result.map(r => r.id)).toEqual([2, 1]); // timed first, unspecified-unit outcome last
  });

  it('does not mutate the input array', () => {
    const input = [outcome(1, 2, 'HOUR'), outcome(2, 1, 'HOUR')];
    const snapshot = input.map(o => o.id);
    sortOutcomesByReactionTime(input);
    expect(input.map(o => o.id)).toEqual(snapshot);
  });
});
