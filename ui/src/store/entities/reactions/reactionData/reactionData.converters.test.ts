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
  ordDataMapToReactionDataMap,
  ordDataToReaction,
  reactionDataMapToOrdDataMap,
  reactionDataToOrd,
} from './reactionData.converters.ts';
import { AppDataType } from './reactionData.types.ts';

describe('ordDataToReaction', () => {
  it('maps a URL value', () => {
    const result = ordDataToReaction({ url: 'https://example.com' }, 'link');
    expect(result.name).toBe('link');
    expect(result.data.type).toBe(AppDataType.Url);
    expect(result.data.value).toBe('https://example.com');
  });

  it('maps a string value', () => {
    expect(ordDataToReaction({ stringValue: 'hello' }, 'n').data).toMatchObject({
      type: AppDataType.Text,
      value: 'hello',
    });
  });

  it('maps a numeric value, preferring float over integer when both are present', () => {
    expect(ordDataToReaction({ floatValue: 1.5 }, 'n').data).toMatchObject({
      type: AppDataType.Number,
      value: 1.5,
    });
    expect(ordDataToReaction({ integerValue: 3 }, 'n').data).toMatchObject({
      type: AppDataType.Number,
      value: 3,
    });
    expect(
      ordDataToReaction({ floatValue: 1.5, integerValue: 9 }, 'n').data,
    ).toMatchObject({
      type: AppDataType.Number,
      value: 1.5,
    });
    expect(ordDataToReaction({}, 'n').data).toMatchObject({
      type: AppDataType.Number,
      value: null,
    });
  });

  it('passes a string bytesValue through and base64-encodes a Uint8Array', () => {
    // The string branch is the copy/paste-via-JSON workaround; the field type is Uint8Array.
    expect(
      ordDataToReaction({ bytesValue: 'YWJj' as unknown as Uint8Array }, 'n').data,
    ).toMatchObject({
      type: AppDataType.Upload,
      value: 'YWJj',
    });
    expect(
      ordDataToReaction({ bytesValue: new Uint8Array([97, 98, 99]) }, 'n').data.value,
    ).toBe('YWJj');
  });

  it('carries description and format', () => {
    const result = ordDataToReaction(
      { stringValue: 's', description: 'desc', format: 'fmt' },
      'n',
    );
    expect(result.description).toBe('desc');
    expect(result.data.format).toBe('fmt');
  });
});

describe('reactionDataToOrd', () => {
  const base = { id: 'i', name: 'n', description: 'd' };

  it('round-trips a URL', () => {
    expect(
      reactionDataToOrd({
        ...base,
        data: { type: AppDataType.Url, value: 'https://x' },
      }).url,
    ).toBe('https://x');
  });

  it('round-trips a string', () => {
    expect(
      reactionDataToOrd({ ...base, data: { type: AppDataType.Text, value: 'hi' } })
        .stringValue,
    ).toBe('hi');
  });

  it('splits numbers into integerValue and floatValue', () => {
    expect(
      reactionDataToOrd({ ...base, data: { type: AppDataType.Number, value: 3 } })
        .integerValue,
    ).toBe(3);
    expect(
      reactionDataToOrd({ ...base, data: { type: AppDataType.Number, value: 1.5 } })
        .floatValue,
    ).toBe(1.5);
  });

  it('decodes an Upload base64 string to bytes', () => {
    // 'YWJj' is base64 for 'abc' (bytes 97, 98, 99).
    const ordData = reactionDataToOrd({
      ...base,
      data: { type: AppDataType.Upload, value: 'YWJj' },
    });
    expect(ordData.bytesValue).toEqual(Uint8Array.from([97, 98, 99]));
  });

  it('adds no value field when value is null', () => {
    const ordData = reactionDataToOrd({
      ...base,
      data: { type: AppDataType.Number, value: null },
    });
    expect(ordData.integerValue).toBeUndefined();
    expect(ordData.floatValue).toBeUndefined();
  });
});

describe('ordDataMapToReactionDataMap / reactionDataMapToOrdDataMap', () => {
  it('keys converted entries by their generated id', () => {
    const result = ordDataMapToReactionDataMap({ first: { stringValue: 'a' } });
    const entries = Object.values(result);
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe('first');
    expect(entries[0].data.value).toBe('a');
    // The map is keyed by the generated id, not by the ord name.
    expect(Object.keys(result)).toEqual([entries[0].id]);
  });

  it('returns null for an empty reaction data map', () => {
    expect(reactionDataMapToOrdDataMap({})).toBeNull();
  });

  it('keys ord entries by the app data name', () => {
    const result = reactionDataMapToOrdDataMap({
      someId: {
        id: 'someId',
        name: 'myField',
        description: undefined,
        data: { type: AppDataType.Text, value: 'x' },
      },
    });
    expect(result?.myField.stringValue).toBe('x');
  });
});
