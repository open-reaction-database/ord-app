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
import type { MessageInitShape } from '@bufbuild/protobuf';
import type {
  Amount,
  AmountSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
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

type MeasuredAmountKind = 'moles' | 'mass' | 'volume';

const unitsByValueByKind: Record<
  MeasuredAmountKind,
  Record<number, ReactionAmountType>
> = {
  moles: molesUnitByValue,
  mass: massUnitByValue,
  volume: volumeUnitByValue,
};

function ordMeasuredAmountToReaction(
  kind: Amount['kind'],
): Pick<ReactionAmount, 'value' | 'precision' | 'units'> | null {
  if (kind.case !== 'moles' && kind.case !== 'mass' && kind.case !== 'volume') {
    return null;
  }
  const { value, precision, units } = kind.value;
  const unitsName = unitsByValueByKind[kind.case][units];
  return units && unitsName ? { value, precision, units: unitsName } : null;
}

export function ordAmountToReaction(ordAmount?: Amount | null): ReactionAmount {
  const measuredAmount = ordAmount ? ordMeasuredAmountToReaction(ordAmount.kind) : null;
  if (measuredAmount) {
    return {
      ...measuredAmount,
      volumeIncludesSolutes: ordBooleanToReaction(ordAmount?.volumeIncludesSolutes),
    };
  }

  return {
    value: null,
    precision: null,
    units: appAmountUnspecified,
    volumeIncludesSolutes: ReactionBoolean.Unspecified,
  };
}

const unitNamesByKind: Array<[MeasuredAmountKind, Array<string>]> = [
  ['moles', molesUnitNames],
  ['mass', massUnitNames],
  ['volume', volumeUnitNames],
];

export function reactionAmountToOrd(
  amount: ReactionAmount,
): MessageInitShape<typeof AmountSchema> | undefined {
  if (amount.units === appAmountUnspecified) {
    return undefined;
  }
  const kind = unitNamesByKind.find(([, names]) => names.includes(amount.units))?.[0];
  if (kind === undefined) {
    return undefined;
  }
  const volumeIncludesSolutes = volumeUnitNames.includes(amount.units)
    ? reactionBooleanToOrd(amount.volumeIncludesSolutes)
    : undefined;
  return {
    volumeIncludesSolutes,
    kind: {
      case: kind,
      value: {
        value: amount.value ?? undefined,
        precision: amount.precision ?? undefined,
        units: unitValueByName[amount.units],
      },
    },
  };
}
