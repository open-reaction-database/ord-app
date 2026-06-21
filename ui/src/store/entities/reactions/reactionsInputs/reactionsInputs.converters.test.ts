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
import {
  ordCrudeComponentToReaction,
  reactionCrudeComponentToOrd,
  ordInputWithoutNameToReaction,
  ordInputToReaction,
  ordInputsToReactionInputs,
  reactionInputsToOrdInputs,
} from './reactionsInputs.converters.ts';
import { ReactionBoolean } from '../reactionEntity/reactionEntity.types.ts';

describe('crude component converters', () => {
  it('maps booleans to the tri-state enum and assigns an id', () => {
    const result = ordCrudeComponentToReaction({
      reactionId: 'r1',
      includesWorkup: true,
      hasDerivedAmount: false,
    });
    expect(typeof result.id).toBe('string');
    expect(result.reactionId).toBe('r1');
    expect(result.includesWorkup).toBe(ReactionBoolean.True);
    expect(result.hasDerivedAmount).toBe(ReactionBoolean.False);
  });

  it('maps the tri-state enum back to ord booleans', () => {
    const reaction = ordCrudeComponentToReaction({
      reactionId: 'r1',
      includesWorkup: true,
      hasDerivedAmount: false,
    });
    const ord = reactionCrudeComponentToOrd(reaction);
    expect(ord.reactionId).toBe('r1');
    expect(ord.includesWorkup).toBe(true);
    expect(ord.hasDerivedAmount).toBe(false);
  });
});

describe('ordInputWithoutNameToReaction', () => {
  it('assigns an id and defaults component lists to empty arrays', () => {
    const result = ordInputWithoutNameToReaction({});
    expect(typeof result.id).toBe('string');
    expect(result.components).toEqual([]);
    expect(result.crudeComponents).toEqual([]);
  });

  it('preserves additionOrder', () => {
    expect(ordInputWithoutNameToReaction({ additionOrder: 2 }).additionOrder).toBe(2);
  });
});

describe('ordInputToReaction', () => {
  it('prepends the input name to the converted input', () => {
    const result = ordInputToReaction({}, 'Reagent A');
    expect(result.name).toBe('Reagent A');
    expect(typeof result.id).toBe('string');
  });
});

describe('input map converters', () => {
  it('keys converted inputs by their generated id', () => {
    const byString = (a: string, b: string) => a.localeCompare(b);
    const result = ordInputsToReactionInputs({ reagent: {}, solvent: {} });
    const entries = Object.values(result);
    expect(entries).toHaveLength(2);
    expect(entries.map(input => input.name).sort(byString)).toEqual([
      'reagent',
      'solvent',
    ]);
    expect(Object.keys(result).sort(byString)).toEqual(
      entries.map(input => input.id).sort(byString),
    );
  });

  it('round-trips a single input back to an ord map keyed by name', () => {
    const reactionInputs = ordInputsToReactionInputs({ reagent: { additionOrder: 1 } });
    const ordInputs = reactionInputsToOrdInputs(reactionInputs);
    expect(Object.keys(ordInputs ?? {})).toEqual(['reagent']);
    expect(ordInputs?.reagent.additionOrder).toBe(1);
  });
});
