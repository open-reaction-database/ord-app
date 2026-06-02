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
import { workupTransform } from './reactionWorkups.transform.ts';
import type { ReactionWorkup } from './reactionWorkups.types.ts';
import type { WorkupType } from '../reactionEntityTypes/reactionEntityTypes.types.ts';

// Every dependent field starts populated; the transform nulls the ones incompatible with `type`.
const makeWorkup = (type: WorkupType): ReactionWorkup =>
  ({
    id: 'w1',
    type,
    duration: { value: 1 },
    amount: { value: 2 },
    keepPhase: 'phase',
    targetPh: 7,
    input: { components: [] },
    temperature: { setpoint: 1 },
    stirring: { rate: 1 },
  }) as unknown as ReactionWorkup;

describe('workupTransform', () => {
  it('keeps only the aliquot-compatible field for an ALIQUOT workup', () => {
    const result = workupTransform(makeWorkup('ALIQUOT'));
    // amount is the only ALIQUOT-compatible dependent field.
    expect(result.amount).toEqual({ value: 2 });
    expect(result.duration).toBeNull();
    expect(result.keepPhase).toBeNull();
    expect(result.targetPh).toBeNull();
    expect(result.input).toBeNull();
    expect(result.temperature).toBeNull();
    expect(result.stirring).toBeNull();
  });

  it('keeps every dependent field for a CUSTOM workup', () => {
    const result = workupTransform(makeWorkup('CUSTOM'));
    expect(result.duration).not.toBeNull();
    expect(result.amount).not.toBeNull();
    expect(result.keepPhase).not.toBeNull();
    expect(result.targetPh).not.toBeNull();
    expect(result.input).not.toBeNull();
    expect(result.temperature).not.toBeNull();
    expect(result.stirring).not.toBeNull();
  });

  it('does not mutate the input workup', () => {
    const workup = makeWorkup('ALIQUOT');
    workupTransform(workup);
    expect(workup.duration).not.toBeNull();
  });
});
