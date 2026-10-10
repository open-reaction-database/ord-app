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
import { create, fromJson, toBinary, type MessageInitShape } from '@bufbuild/protobuf';
import { DataSchema } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import {
  ordDataMapToReactionDataMap,
  ordDataToReaction,
  reactionDataMapToOrdDataMap,
  reactionDataToOrd,
} from './reactionData.converters.ts';
import { AppDataType } from './reactionData.types.ts';

const data = (init: MessageInitShape<typeof DataSchema>) => create(DataSchema, init);

describe('ordDataToReaction', () => {
  it('maps a URL value', () => {
    const result = ordDataToReaction(
      data({ kind: { case: 'url', value: 'https://example.com' } }),
      'link',
    );
    expect(result.name).toBe('link');
    expect(result.data.type).toBe(AppDataType.Url);
    expect(result.data.value).toBe('https://example.com');
  });

  it('maps a string value', () => {
    expect(
      ordDataToReaction(data({ kind: { case: 'stringValue', value: 'hello' } }), 'n')
        .data,
    ).toMatchObject({
      type: AppDataType.Text,
      value: 'hello',
    });
  });

  it('maps a numeric value from either numeric case', () => {
    expect(
      ordDataToReaction(data({ kind: { case: 'floatValue', value: 1.5 } }), 'n').data,
    ).toMatchObject({
      type: AppDataType.Number,
      value: 1.5,
    });
    expect(
      ordDataToReaction(data({ kind: { case: 'integerValue', value: 3 } }), 'n').data,
    ).toMatchObject({
      type: AppDataType.Number,
      value: 3,
    });
    expect(ordDataToReaction(data({}), 'n').data).toMatchObject({
      type: AppDataType.Number,
      value: null,
    });
  });

  it('reads an empty URL or string as an empty number', () => {
    for (const kind of [
      { case: 'url', value: '' },
      { case: 'stringValue', value: '' },
    ] as const) {
      expect(ordDataToReaction(data({ kind }), 'n').data).toMatchObject({
        type: AppDataType.Number,
        value: null,
      });
    }
  });

  it('base64-encodes bytes, including bytes read from proto3 JSON', () => {
    expect(
      ordDataToReaction(
        data({ kind: { case: 'bytesValue', value: new Uint8Array([97, 98, 99]) } }),
        'n',
      ).data,
    ).toMatchObject({
      type: AppDataType.Upload,
      value: 'YWJj',
    });
    expect(
      ordDataToReaction(fromJson(DataSchema, { bytesValue: 'YWJj' }), 'n').data.value,
    ).toBe('YWJj');
  });

  it('carries description and format, leaving them undefined when unset', () => {
    const result = ordDataToReaction(
      data({
        kind: { case: 'stringValue', value: 's' },
        description: 'desc',
        format: 'fmt',
      }),
      'n',
    );
    expect(result.description).toBe('desc');
    expect(result.data.format).toBe('fmt');

    const unset = ordDataToReaction(data({}), 'n');
    expect(unset.description).toBeUndefined();
    expect(unset.data.format).toBeUndefined();
  });
});

describe('reactionDataToOrd', () => {
  const base = { id: 'i', name: 'n', description: 'd' };

  it('round-trips a URL', () => {
    expect(
      reactionDataToOrd({
        ...base,
        data: { type: AppDataType.Url, value: 'https://x' },
      }).kind,
    ).toEqual({ case: 'url', value: 'https://x' });
  });

  it('round-trips a string', () => {
    expect(
      reactionDataToOrd({ ...base, data: { type: AppDataType.Text, value: 'hi' } })
        .kind,
    ).toEqual({ case: 'stringValue', value: 'hi' });
  });

  it('splits numbers into integerValue and floatValue', () => {
    expect(
      reactionDataToOrd({ ...base, data: { type: AppDataType.Number, value: 3 } }).kind,
    ).toEqual({ case: 'integerValue', value: 3 });
    expect(
      reactionDataToOrd({ ...base, data: { type: AppDataType.Number, value: 1.5 } })
        .kind,
    ).toEqual({ case: 'floatValue', value: 1.5 });
  });

  it('writes an integer outside the int32 range as a float', () => {
    const toOrd = (value: number) =>
      create(
        DataSchema,
        reactionDataToOrd({ ...base, data: { type: AppDataType.Number, value } }),
      );
    expect(toOrd(2 ** 31 - 1).kind).toEqual({
      case: 'integerValue',
      value: 2 ** 31 - 1,
    });
    expect(toOrd(-(2 ** 31)).kind).toEqual({ case: 'integerValue', value: -(2 ** 31) });
    expect(toOrd(2 ** 31).kind).toEqual({ case: 'floatValue', value: 2 ** 31 });
    expect(toOrd(-(2 ** 31) - 1).kind).toEqual({
      case: 'floatValue',
      value: -(2 ** 31) - 1,
    });
    expect(() => toBinary(DataSchema, toOrd(3e9))).not.toThrow();
  });

  it('decodes an Upload base64 string to bytes', () => {
    // 'YWJj' is base64 for 'abc' (bytes 97, 98, 99).
    const ordData = reactionDataToOrd({
      ...base,
      data: { type: AppDataType.Upload, value: 'YWJj' },
    });
    expect(ordData.kind).toEqual({
      case: 'bytesValue',
      value: Uint8Array.from([97, 98, 99]),
    });
  });

  it('leaves the kind oneof unset when value is null', () => {
    const ordData = reactionDataToOrd({
      ...base,
      data: { type: AppDataType.Number, value: null },
    });
    expect(ordData.kind).toBeUndefined();
    expect(create(DataSchema, ordData).kind.case).toBeUndefined();
  });
});

describe('ordDataMapToReactionDataMap / reactionDataMapToOrdDataMap', () => {
  it('keys converted entries by their generated id', () => {
    const result = ordDataMapToReactionDataMap({
      first: data({ kind: { case: 'stringValue', value: 'a' } }),
    });
    const entries = Object.values(result);
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe('first');
    expect(entries[0].data.value).toBe('a');
    // The map is keyed by the generated id, not by the ord name.
    expect(Object.keys(result)).toEqual([entries[0].id]);
  });

  it('returns undefined for an empty reaction data map', () => {
    expect(reactionDataMapToOrdDataMap({})).toBeUndefined();
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
    expect(result?.myField.kind).toEqual({ case: 'stringValue', value: 'x' });
  });
});
