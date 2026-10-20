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
import { create } from '@bufbuild/protobuf';
import {
  CompoundIdentifierSchema,
  DateTimeSchema,
  ReactionIdentifierSchema,
  StirringConditions_StirringRateSchema,
  TextureSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import {
  ordBooleanToReaction,
  ordCompoundIdentifierToReaction,
  ordDateTimeToReaction,
  ordReactionIdentifierToReaction,
  ordScalarToReaction,
  ordStirringRateToReaction,
  ordTextureToReaction,
  ordValuePrecisionToReaction,
  reactionBooleanToOrd,
  reactionDateTimeToOrd,
  reactionValuePrecisionToOrd,
  withId,
  withIdName,
  withoutId,
  withoutIdName,
} from './reactionEntity.converters.ts';
import { ReactionBoolean } from './reactionEntity.types.ts';

describe('withId / withoutId', () => {
  it('adds a string id, preserving other fields', () => {
    const result = withId({ value: 1 });
    expect(result.value).toBe(1);
    expect(typeof result.id).toBe('string');
    expect(result.id.length).toBeGreaterThan(0);
  });

  it('strips the id', () => {
    expect(withoutId({ id: 'abc', value: 1 })).toEqual({ value: 1 });
  });
});

describe('withIdName / withoutIdName', () => {
  it('adds a string id and the given name', () => {
    const result = withIdName({ value: 1 }, 'label');
    expect(result.value).toBe(1);
    expect(result.name).toBe('label');
    expect(typeof result.id).toBe('string');
  });

  it('strips id and name', () => {
    expect(withoutIdName({ id: 'abc', name: 'label', value: 1 })).toEqual({ value: 1 });
  });
});

// The form holds times with an offset in the user's zone, so these assert what reaches ord, which
// does not depend on the zone the tests run in.
describe('DateTime converters', () => {
  const roundTrip = (value: string) =>
    reactionDateTimeToOrd(ordDateTimeToReaction(create(DateTimeSchema, { value })));

  it('keeps a date as a date', () => {
    expect(ordDateTimeToReaction(create(DateTimeSchema, { value: '2024-05-08' }))).toBe(
      '2024-05-08',
    );
    expect(reactionDateTimeToOrd('2024-05-08')).toEqual({ value: '2024-05-08' });
  });

  it('keeps a time without an offset as written', () => {
    expect(
      ordDateTimeToReaction(create(DateTimeSchema, { value: '2021-10-22T22:19:55' })),
    ).toBe('2021-10-22T22:19:55');
    expect(reactionDateTimeToOrd('2021-10-22T22:19:55.5')).toEqual({
      value: '2021-10-22T22:19:55.5',
    });
  });

  it('writes a time with an offset as the UTC instant it names, with its Z', () => {
    expect(roundTrip('2024-06-01T12:00:00Z')).toEqual({
      value: '2024-06-01T12:00:00Z',
    });
    expect(roundTrip('2024-06-01T21:00:00+09:00')).toEqual({
      value: '2024-06-01T12:00:00Z',
    });
    expect(reactionDateTimeToOrd('2024-06-01T12:00:00-04:00')).toEqual({
      value: '2024-06-01T16:00:00Z',
    });
  });

  // The suite may run in UTC, where showing a time in the user's zone changes nothing.
  it("shows a time with an offset in the user's zone, with that zone's offset", async () => {
    vi.stubEnv('TZ', 'Asia/Tokyo');
    vi.resetModules();
    try {
      const converters = await import('./reactionEntity.converters.ts');
      expect(
        converters.ordDateTimeToReaction(
          create(DateTimeSchema, { value: '2024-06-01T03:00:00Z' }),
        ),
      ).toBe('2024-06-01T12:00:00+09:00');
      expect(converters.reactionDateTimeToOrd('2024-06-01T12:00:00+09:00')).toEqual({
        value: '2024-06-01T03:00:00Z',
      });
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });

  it('leaves an empty value unset', () => {
    expect(ordDateTimeToReaction(create(DateTimeSchema, { value: '' }))).toBeNull();
    expect(reactionDateTimeToOrd(null)).toBeUndefined();
  });
});

describe('ordBooleanToReaction', () => {
  it('maps null/undefined to Unspecified', () => {
    expect(ordBooleanToReaction()).toBe(ReactionBoolean.Unspecified);
    expect(ordBooleanToReaction(null)).toBe(ReactionBoolean.Unspecified);
  });

  it('maps booleans to True/False', () => {
    expect(ordBooleanToReaction(true)).toBe(ReactionBoolean.True);
    expect(ordBooleanToReaction(false)).toBe(ReactionBoolean.False);
  });
});

describe('reactionBooleanToOrd', () => {
  it('is the inverse of ordBooleanToReaction', () => {
    expect(reactionBooleanToOrd(ReactionBoolean.Unspecified)).toBeUndefined();
    expect(reactionBooleanToOrd(ReactionBoolean.True)).toBe(true);
    expect(reactionBooleanToOrd(ReactionBoolean.False)).toBe(false);
  });
});

describe('ordValuePrecisionToReaction', () => {
  it('passes through value and precision', () => {
    expect(ordValuePrecisionToReaction({ value: 1, precision: 2 })).toEqual({
      value: 1,
      precision: 2,
    });
  });

  it('defaults missing fields to null', () => {
    expect(ordValuePrecisionToReaction(undefined)).toEqual({
      value: null,
      precision: null,
    });
    expect(ordValuePrecisionToReaction({ value: 5 })).toEqual({
      value: 5,
      precision: null,
    });
  });
});

describe('reactionValuePrecisionToOrd', () => {
  it('returns undefined when both value and precision are null', () => {
    expect(
      reactionValuePrecisionToOrd({ value: null, precision: null }),
    ).toBeUndefined();
  });

  it('returns the value/precision pair otherwise, leaving a null field unset', () => {
    expect(reactionValuePrecisionToOrd({ value: 1, precision: null })).toStrictEqual({
      value: 1,
      precision: undefined,
    });
  });
});

describe('ordScalarToReaction', () => {
  it('reads the proto3 zero value as unset', () => {
    expect(ordScalarToReaction('')).toBeUndefined();
    expect(ordScalarToReaction(0)).toBeUndefined();
    expect(ordScalarToReaction(undefined)).toBeUndefined();
  });

  it('passes other values through', () => {
    expect(ordScalarToReaction('details')).toBe('details');
    expect(ordScalarToReaction(250)).toBe(250);
  });
});

describe('unset string and number fields', () => {
  it('reads unset type details as null', () => {
    expect(ordTextureToReaction(create(TextureSchema))).toEqual({
      type: 'UNSPECIFIED',
      details: null,
    });
  });

  it('reads unset reaction identifier strings as null', () => {
    const identifier = ordReactionIdentifierToReaction(
      create(ReactionIdentifierSchema),
    );
    expect(identifier.value).toBeNull();
    expect(identifier.details).toBeNull();
  });

  it('reads unset compound identifier strings as undefined', () => {
    const identifier = ordCompoundIdentifierToReaction(
      create(CompoundIdentifierSchema, { value: 'CCO' }),
    );
    expect(identifier.value).toBe('CCO');
    expect(identifier.details).toBeUndefined();
  });

  it('reads an unset stirring rate as undefined rather than 0', () => {
    expect(
      ordStirringRateToReaction(create(StirringConditions_StirringRateSchema)).rpm,
    ).toBeUndefined();
  });
});
