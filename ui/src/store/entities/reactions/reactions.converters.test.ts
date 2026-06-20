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
import { describe, it, expect, vi } from 'vitest';

// ordReactionToReaction/reactionToOrdReaction/linkReactionEntities are thin
// orchestrators delegating each field to a per-entity sub-converter. Stub every
// sub-converter with a recognizable sentinel so the tests assert the field
// wiring and the length-gated null branches without the sub-converters' logic.
vi.mock('store/entities/reactions/reactionsInputs/reactionsInputs.converters.ts', () => ({
  ordInputsToReactionInputs: () => 'INPUTS',
  reactionInputsToOrdInputs: () => 'ORD_INPUTS',
}));
vi.mock('store/entities/reactions/reactionsOutcomes/reactionOutcomes.converters.ts', () => ({
  linkReactionOutcome: (outcome: unknown) => ({ linked: outcome }),
  ordOutcomesListToReactionOutcomesList: () => 'OUTCOMES',
  reactionOutcomesListToOrdOutcomesList: () => 'ORD_OUTCOMES',
}));
vi.mock('store/entities/reactions/reactionEntity/reactionEntity.converters.ts', () => ({
  ordReactionIdentifierToReaction: (identifier: unknown) => ({ id: identifier }),
  reactionIdentifierToOrd: (identifier: unknown) => ({ ordId: identifier }),
}));
vi.mock('store/entities/reactions/reactionNotes/reactionNotes.converters.ts', () => ({
  ordNotesToReaction: () => 'NOTES',
  reactionNotesToOrd: () => 'ORD_NOTES',
}));
vi.mock('./reactionObservation/reactionObservation.converter', () => ({
  ordObservationToReaction: (observation: unknown) => ({ obs: observation }),
  reactionObservationToOrd: (observation: unknown) => ({ ordObs: observation }),
}));
vi.mock('./reactionProvenance/reactionProvenance.converters.ts', () => ({
  ordProvenanceToReaction: () => 'PROVENANCE',
  reactionProvenanceToOrd: () => 'ORD_PROVENANCE',
}));
vi.mock('./reactionConditions/reactionConditions.converter', () => ({
  ordConditionsToReaction: () => 'CONDITIONS',
  reactionConditionsToOrd: () => 'ORD_CONDITIONS',
}));
vi.mock('./reactionWorkups/reactionWorkups.converters.ts', () => ({
  ordWorkupToReaction: (workup: unknown) => ({ wu: workup }),
  reactionWorkupToOrd: (workup: unknown) => ({ ordWu: workup }),
}));
vi.mock('./reactionSetup/reactionSetup.converter.ts', () => ({
  ordSetupToReactionSetup: () => 'SETUP',
  reactionSetupToOrd: () => 'ORD_SETUP',
}));

import type { AppReaction } from './reactions.types.ts';
import type { ord } from 'ord-schema-protobufjs';
import {
  convertReactionFloatsToDoubles,
  linkReactionEntities,
  ordReactionToReaction,
  reactionToOrdReaction,
} from './reactions.converters.ts';

describe('convertReactionFloatsToDoubles', () => {
  it('rounds floats to 7 significant figures in place', () => {
    const part = { value: 1.123456789 };
    convertReactionFloatsToDoubles(part);
    // eslint-disable-next-line sonarjs/no-floating-point-equality -- asserting the exact rounded output is the point of this test
    expect(part.value).toBe(1.123457);
  });

  it('leaves integers unchanged', () => {
    const part = { count: 42 };
    convertReactionFloatsToDoubles(part);
    expect(part.count).toBe(42);
  });

  it('recurses into nested objects and objects within arrays', () => {
    const part = { outer: { inner: 2.000000123 }, list: [{ x: 3.000000456 }] };
    convertReactionFloatsToDoubles(part);
    expect(part.outer.inner).toBe(2);
    expect(part.list[0].x).toBe(3);
  });

  it('leaves bare numeric array elements untouched (only object properties are rounded)', () => {
    const part = { values: [1.123456789] };
    convertReactionFloatsToDoubles(part);
    // eslint-disable-next-line sonarjs/no-floating-point-equality -- asserting the value is left exactly untouched is the point of this test
    expect(part.values[0]).toBe(1.123456789);
  });

  it('leaves non-numeric values untouched', () => {
    const part = { name: 'ethanol', flag: true };
    convertReactionFloatsToDoubles(part);
    expect(part).toEqual({ name: 'ethanol', flag: true });
  });

  it('is a no-op for null or non-object input', () => {
    expect(() => convertReactionFloatsToDoubles(null)).not.toThrow();
    expect(() => convertReactionFloatsToDoubles(5)).not.toThrow();
  });
});

describe('ordReactionToReaction', () => {
  it('spreads the proto and routes each field through its sub-converter', () => {
    const reaction = {
      reactionId: 'r1',
      extra: 'preserved',
      inputs: { a: 1 },
      outcomes: ['o1'],
      identifiers: ['i1', 'i2'],
      setup: { s: 1 },
      observations: ['ob1'],
      conditions: { c: 1 },
      notes: { n: 1 },
      provenance: { p: 1 },
      workups: ['w1'],
    } as unknown as ord.IReaction;

    expect(ordReactionToReaction(reaction)).toEqual({
      reactionId: 'r1',
      extra: 'preserved',
      inputs: 'INPUTS',
      outcomes: 'OUTCOMES',
      identifiers: [{ id: 'i1' }, { id: 'i2' }],
      setup: 'SETUP',
      observations: [{ obs: 'ob1' }],
      conditions: 'CONDITIONS',
      notes: 'NOTES',
      provenance: 'PROVENANCE',
      workups: [{ wu: 'w1' }],
    });
  });

  it('defaults missing list fields to empty arrays', () => {
    const result = ordReactionToReaction({ reactionId: 'r2' } as unknown as ord.IReaction);
    expect(result.identifiers).toEqual([]);
    expect(result.observations).toEqual([]);
    expect(result.workups).toEqual([]);
  });
});

describe('reactionToOrdReaction', () => {
  const base = {
    reactionId: 'r1',
    inputs: {},
    outcomes: [],
    setup: {},
    conditions: {},
    notes: {},
    provenance: {},
  };

  it('nulls the list fields that are empty and routes the rest through sub-converters', () => {
    const result = reactionToOrdReaction({
      ...base,
      identifiers: [],
      observations: [],
      workups: [],
    } as unknown as AppReaction);

    expect(result).toEqual({
      reactionId: 'r1',
      inputs: 'ORD_INPUTS',
      outcomes: 'ORD_OUTCOMES',
      identifiers: null,
      setup: 'ORD_SETUP',
      observations: null,
      conditions: 'ORD_CONDITIONS',
      notes: 'ORD_NOTES',
      provenance: 'ORD_PROVENANCE',
      workups: null,
    });
  });

  it('maps non-empty list fields through their sub-converters', () => {
    const result = reactionToOrdReaction({
      ...base,
      identifiers: ['i1'],
      observations: ['ob1'],
      workups: ['w1'],
    } as unknown as AppReaction);

    expect(result.identifiers).toEqual([{ ordId: 'i1' }]);
    expect(result.observations).toEqual([{ ordObs: 'ob1' }]);
    expect(result.workups).toEqual([{ ordWu: 'w1' }]);
  });
});

describe('linkReactionEntities', () => {
  it('links every outcome while preserving the rest of the reaction', () => {
    const reaction = {
      reactionId: 'r1',
      extra: 'preserved',
      inputs: { a: 1 },
      outcomes: ['o1', 'o2'],
    } as unknown as AppReaction;

    expect(linkReactionEntities(reaction)).toEqual({
      reactionId: 'r1',
      extra: 'preserved',
      inputs: { a: 1 },
      outcomes: [{ linked: 'o1' }, { linked: 'o2' }],
    });
  });
});
