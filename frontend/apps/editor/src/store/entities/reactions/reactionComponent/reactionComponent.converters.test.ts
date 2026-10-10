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
import { create } from '@bufbuild/protobuf';
import {
  CompoundPreparationSchema,
  ProductMeasurementSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import {
  ordMeasurementToReaction,
  ordPreparationToReaction,
  reactionMeasurementToOrd,
  reactionPreparationToOrd,
} from './reactionComponent.converters.ts';
import {
  type ReactionComponentPreparation,
  ReactionMeasurementValueType,
} from './reactionComponent.types.ts';

// CompoundPreparationType: CUSTOM = 1, SYNTHESIZED = 6.
const SYNTHESIZED = 6;
// ProductMeasurementType: YIELD = 3.
const YIELD = 3;

describe('ordPreparationToReaction', () => {
  it('assigns an id and maps the type to its name', () => {
    const result = ordPreparationToReaction(
      create(CompoundPreparationSchema, {
        type: SYNTHESIZED,
        details: 'made in house',
        reactionId: 'r1',
      }),
    );
    expect(typeof result.id).toBe('string');
    expect(result.type).toBe('SYNTHESIZED');
    expect(result.details).toBe('made in house');
    expect(result.reactionId).toBe('r1');
  });

  it('leaves unset string fields undefined', () => {
    const result = ordPreparationToReaction(create(CompoundPreparationSchema));
    expect(result.type).toBe('UNSPECIFIED');
    expect(result.details).toBeUndefined();
    expect(result.reactionId).toBeUndefined();
  });
});

describe('reactionPreparationToOrd', () => {
  const base = { id: 'p1', details: 'd', reactionId: 'r1' };

  it('keeps reactionId only for SYNTHESIZED preparations', () => {
    const synthesized = reactionPreparationToOrd({
      ...base,
      type: 'SYNTHESIZED',
    } as ReactionComponentPreparation);
    expect(synthesized.type).toBe(SYNTHESIZED);
    expect(synthesized.reactionId).toBe('r1');
  });

  it('drops reactionId for non-SYNTHESIZED preparations', () => {
    const custom = reactionPreparationToOrd({
      ...base,
      type: 'CUSTOM',
    } as ReactionComponentPreparation);
    expect(custom.reactionId).toBeUndefined();
    expect(custom.details).toBe('d');
  });
});

describe('measurement value oneof', () => {
  it('reads each case of the value oneof', () => {
    const percentage = ordMeasurementToReaction(
      create(ProductMeasurementSchema, {
        type: YIELD,
        value: { case: 'percentage', value: { value: 85, precision: 2 } },
      }),
    );
    expect(percentage.value).toEqual({
      type: ReactionMeasurementValueType.Percent,
      value: { value: 85, precision: 2 },
    });

    const floatValue = ordMeasurementToReaction(
      create(ProductMeasurementSchema, {
        value: { case: 'floatValue', value: { value: 1.5 } },
      }),
    );
    expect(floatValue.value).toEqual({
      type: ReactionMeasurementValueType.Number,
      value: { value: 1.5 },
    });

    const stringValue = ordMeasurementToReaction(
      create(ProductMeasurementSchema, {
        value: { case: 'stringValue', value: '2:1' },
      }),
    );
    expect(stringValue.value).toEqual({
      type: ReactionMeasurementValueType.String,
      value: '2:1',
    });

    const amount = ordMeasurementToReaction(
      create(ProductMeasurementSchema, {
        value: {
          case: 'amount',
          value: { kind: { case: 'mass', value: { value: 3 } } },
        },
      }),
    );
    expect(amount.value?.type).toBe(ReactionMeasurementValueType.Mass);
  });

  it('reads an unset or empty value as no value', () => {
    expect(ordMeasurementToReaction(create(ProductMeasurementSchema)).value).toBeNull();
    expect(
      ordMeasurementToReaction(
        create(ProductMeasurementSchema, { value: { case: 'stringValue', value: '' } }),
      ).value,
    ).toBeNull();
  });

  it('round-trips a percentage through ord', () => {
    const measurement = ordMeasurementToReaction(
      create(ProductMeasurementSchema, {
        type: YIELD,
        details: 'isolated',
        value: { case: 'percentage', value: { value: 85, precision: 2 } },
      }),
    );
    const ordMeasurement = create(
      ProductMeasurementSchema,
      reactionMeasurementToOrd(measurement),
    );
    expect(ordMeasurement.type).toBe(YIELD);
    expect(ordMeasurement.details).toBe('isolated');
    expect(ordMeasurement.value.case).toBe('percentage');
    expect(ordMeasurement.value.value).toMatchObject({ value: 85, precision: 2 });
  });
});
