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
import { ordMapToKeyValueObject } from './ordMapToKeyValueObject.ts';

describe('ordMapToKeyValueObject', () => {
  it('turns a record into label/value pairs, stringifying the key as the label', () => {
    expect(ordMapToKeyValueObject({ GRAM: 1, MILLIGRAM: 2 })).toEqual([
      { label: 'GRAM', value: 1 },
      { label: 'MILLIGRAM', value: 2 },
    ]);
  });

  it('preserves string values', () => {
    expect(ordMapToKeyValueObject({ X: 'x' })).toEqual([{ label: 'X', value: 'x' }]);
  });

  it('returns an empty array for an empty record', () => {
    expect(ordMapToKeyValueObject({})).toEqual([]);
  });
});
