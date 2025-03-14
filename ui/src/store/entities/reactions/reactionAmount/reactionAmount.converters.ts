/*
 * Copyright 2024 Open Reaction Database Project Authors
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
import type { ord } from 'ord-schema-protobufjs';
import type {
  ReactionAmount,
  ReactionAmountType,
} from 'store/entities/reactions/reactionAmount/reactionAmount.types.ts';
import {
  appAmountUnspecified,
  massUnitByValue,
  massUnitNames,
  molesUnitByValue,
  molesUnitNames,
  unitValueByName,
  volumeUnitByValue,
  volumeUnitNames,
} from 'store/entities/reactions/reactionAmount/reactionAmount.models.ts';
import {
  ordBooleanToReaction,
  reactionBooleanToOrd,
} from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import { ReactionBoolean } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';

const amountOptions: Array<['moles' | 'mass' | 'volume', Record<number, ReactionAmountType>]> = [
  ['moles', molesUnitByValue],
  ['mass', massUnitByValue],
  ['volume', volumeUnitByValue],
];

export function ordAmountToReaction(ordAmount?: ord.IAmount | null): ReactionAmount {
  const requiredOrdAmount = ordAmount || ({} as ord.IAmount);
  const volumeIncludesSolutes = ordBooleanToReaction(requiredOrdAmount.volumeIncludesSolutes);

  const result = amountOptions.reduce((acc: ReactionAmount | null, [key, unitsByValue]) => {
    const currentValue = requiredOrdAmount[key];
    const units = unitsByValue[currentValue?.units ?? 0];
    if (currentValue?.units && units) {
      return { ...currentValue, units: units, volumeIncludesSolutes };
    }
    return acc;
  }, null);

  return (
    result ?? {
      value: null,
      precision: null,
      units: appAmountUnspecified,
      volumeIncludesSolutes: ReactionBoolean.Unspecified,
    }
  );
}

const x: Array<['moles' | 'mass' | 'volume', Array<string>]> = [
  ['moles', molesUnitNames],
  ['mass', massUnitNames],
  ['volume', volumeUnitNames],
];

export function reactionAmountToOrd(amount: ReactionAmount): ord.IAmount | null {
  if (amount.units === appAmountUnspecified) {
    return null;
  }
  const volumeIncludesSolutes = reactionBooleanToOrd(amount.volumeIncludesSolutes);
  const ordAmountValue = {
    value: amount.value,
    precision: amount.precision,
    units: unitValueByName[amount.units],
  };

  const result = x.reduce((acc: ord.IAmount | null, [key, names]) => {
    if (names.includes(amount.units)) {
      return { [key]: ordAmountValue };
    }
    return acc;
  }, null);

  return result === null
    ? null
    : {
        volumeIncludesSolutes,
        ...result,
      };
}
