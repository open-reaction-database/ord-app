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
  AppReactionAmount,
  AppReactionAmountType,
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
  ordBooleanToReactionBoolean,
  reactionBooleanToOrdBoolean,
} from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import { ReactionBoolean } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';

const amountOptions: Array<['moles' | 'mass' | 'volume', Record<number, AppReactionAmountType>]> = [
  ['moles', molesUnitByValue],
  ['mass', massUnitByValue],
  ['volume', volumeUnitByValue],
];

export function ordAmountToReactionAmount(ordAmount?: ord.IAmount | null): AppReactionAmount {
  const requiredOrdAmount = ordAmount || ({} as ord.IAmount);
  const volumeIncludesSolutes = ordBooleanToReactionBoolean(requiredOrdAmount.volumeIncludesSolutes);

  const result = amountOptions.reduce((acc: AppReactionAmount | null, [key, unitsByValue]) => {
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

export function reactionAmountToOrdAmount(amount: AppReactionAmount): ord.IAmount | null {
  if (amount.units === appAmountUnspecified) {
    return null;
  }
  const volumeIncludesSolutes = reactionBooleanToOrdBoolean(amount.volumeIncludesSolutes);
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
