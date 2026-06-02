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
import { ordAmountToReaction, reactionAmountToOrd } from './reactionAmount.converters.ts';
import {
  appAmountUnspecified,
  massUnitNames,
  molesUnitNames,
  volumeUnitNames,
  unitValueByName,
} from './reactionAmount.models.ts';
import type { AppMassUnit, AppMolesUnit, AppVolumeUnit } from './reactionAmount.types.ts';
import { ReactionBoolean } from '../reactionEntity/reactionEntity.types.ts';

// Object.keys() widens these to string[]; narrow back to the unit unions for the converters.
const massUnit = massUnitNames[0] as AppMassUnit;
const molesUnit = molesUnitNames[0] as AppMolesUnit;
const volumeUnit = volumeUnitNames[0] as AppVolumeUnit;

describe('reactionAmountToOrd', () => {
  it('returns null when the unit is unspecified', () => {
    expect(
      reactionAmountToOrd({
        value: 1,
        precision: null,
        units: appAmountUnspecified,
        volumeIncludesSolutes: ReactionBoolean.Unspecified,
      }),
    ).toBeNull();
  });

  it('nests value/precision under the matching dimension key and resolves the unit value', () => {
    const result = reactionAmountToOrd({
      value: 5,
      precision: 0.1,
      units: massUnit,
      volumeIncludesSolutes: ReactionBoolean.Unspecified,
    });
    expect(result?.mass).toEqual({ value: 5, precision: 0.1, units: unitValueByName[massUnit] });
    // A mass amount is not a volume, so volumeIncludesSolutes is set to null (present, not omitted).
    expect(result?.volumeIncludesSolutes).toBeNull();
    expect(result?.moles).toBeUndefined();
  });

  it('nests a moles amount under the moles key', () => {
    const result = reactionAmountToOrd({
      value: 3,
      precision: null,
      units: molesUnit,
      volumeIncludesSolutes: ReactionBoolean.Unspecified,
    });
    expect(result?.moles).toEqual({ value: 3, precision: null, units: unitValueByName[molesUnit] });
    expect(result?.mass).toBeUndefined();
    expect(result?.volume).toBeUndefined();
  });

  it('keeps volumeIncludesSolutes only for volume units', () => {
    const result = reactionAmountToOrd({
      value: 2,
      precision: null,
      units: volumeUnit,
      volumeIncludesSolutes: ReactionBoolean.True,
    });
    expect(result?.volume).toEqual({ value: 2, precision: null, units: unitValueByName[volumeUnit] });
    expect(result?.volumeIncludesSolutes).toBe(true);
  });
});

describe('ordAmountToReaction', () => {
  it('returns the unspecified default for null/empty input', () => {
    const expected = {
      value: null,
      precision: null,
      units: appAmountUnspecified,
      volumeIncludesSolutes: ReactionBoolean.Unspecified,
    };
    expect(ordAmountToReaction(null)).toEqual(expected);
    expect(ordAmountToReaction({})).toEqual(expected);
  });

  it('maps the dimension value back to its unit name', () => {
    const result = ordAmountToReaction({ mass: { value: 5, precision: 0.1, units: unitValueByName[massUnit] } });
    expect(result).toMatchObject({
      value: 5,
      precision: 0.1,
      units: massUnit,
      volumeIncludesSolutes: ReactionBoolean.Unspecified,
    });
  });

  it('reads volumeIncludesSolutes for volume amounts', () => {
    const result = ordAmountToReaction({
      volume: { value: 2, precision: null, units: unitValueByName[volumeUnit] },
      volumeIncludesSolutes: true,
    });
    expect(result).toMatchObject({ value: 2, units: volumeUnit, volumeIncludesSolutes: ReactionBoolean.True });
  });
});

describe('round trip', () => {
  it.each([
    ['mass', massUnit],
    ['moles', molesUnit],
    ['volume', volumeUnit],
  ])('preserves a %s amount through ord and back', (_dimension, units) => {
    const amount = {
      value: 12,
      precision: 0.5,
      units,
      volumeIncludesSolutes: ReactionBoolean.Unspecified,
    };
    expect(ordAmountToReaction(reactionAmountToOrd(amount))).toMatchObject(amount);
  });
});
