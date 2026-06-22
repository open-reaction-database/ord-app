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
import {
  ordBooleanToReaction,
  ordValuePrecisionToReaction,
  reactionBooleanToOrd,
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
    expect(reactionBooleanToOrd(ReactionBoolean.Unspecified)).toBeNull();
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
  it('returns null when both value and precision are null', () => {
    expect(reactionValuePrecisionToOrd({ value: null, precision: null })).toBeNull();
  });

  it('returns the value/precision pair otherwise', () => {
    expect(reactionValuePrecisionToOrd({ value: 1, precision: null })).toEqual({
      value: 1,
      precision: null,
    });
  });
});
