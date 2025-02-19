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
import type { AppReactionInput, AppReactionCompound, AppReactionAmount } from './reactionInputs.types.ts';
import { v4 as uuid } from 'uuid';
import {
  appAmountUnspecified,
  massUnitByValue,
  massUnitNames,
  molesUnitByValue,
  molesUnitNames,
  unitValueByName,
  volumeUnitByValue,
  volumeUnitNames,
} from 'store/entities/reactions/reactionsInputs/reactionsInputs.models.ts';
import type { AppReaction } from 'store/entities/reactions/reactions.types.ts';
import {
  ordDataMapToReactionDataMap,
  reactionDataMapToOrdDataMap,
} from 'store/entities/reactions/reactionData/reactionData.converters.ts';

// TODO rewrite this mess NORMALLY
// eslint-disable-next-line complexity
function ordAmountToReactionAmount(ordAmount?: ord.IAmount | null): AppReactionAmount {
  const { moles, mass, volume } = ordAmount || {};
  if (moles?.units && molesUnitByValue[moles.units]) {
    return {
      ...moles,
      units: molesUnitByValue[moles.units],
    };
  }
  if (mass?.units && massUnitByValue[mass.units]) {
    return {
      ...mass,
      units: molesUnitByValue[mass.units],
    };
  }
  if (volume?.units && volumeUnitByValue[volume.units || 0]) {
    return {
      ...volume,
      units: molesUnitByValue[volume.units],
    };
  }

  return {
    value: null,
    precision: null,
    units: appAmountUnspecified,
  };
}

function reactionAmountToOrdAmount(amount: AppReactionAmount): ord.IAmount | null {
  if (amount.units === appAmountUnspecified) {
    return null;
  }
  const ordAmountValue = {
    value: amount.value,
    precision: amount.precision,
    units: unitValueByName[amount.units],
  };

  if (molesUnitNames.includes(amount.units)) {
    return {
      moles: ordAmountValue,
    };
  }
  if (massUnitNames.includes(amount.units)) {
    return {
      mass: ordAmountValue,
    };
  }
  if (volumeUnitNames.includes(amount.units)) {
    return {
      volume: ordAmountValue,
    };
  }
  // Unreachable but typescript cannot infer it
  return null;
}

export function ordCompoundToReactionCompound(ordCompound: ord.ICompound): AppReactionCompound {
  const { amount, ...rest } = ordCompound;

  return {
    ...rest,
    features: ordDataMapToReactionDataMap(ordCompound.features || {}),
    amount: ordAmountToReactionAmount(amount),
  };
}

function reactionCompoundToOrdCompound(appCompound: AppReactionCompound): ord.ICompound {
  const { amount, ...rest } = appCompound;
  return {
    ...rest,
    features: reactionDataMapToOrdDataMap(appCompound.features),
    amount: reactionAmountToOrdAmount(amount),
  };
}

export function ordInputToReactionsInput(ordInput: ord.IReactionInput, name: string): AppReactionInput {
  const { components, ...rest } = ordInput;
  return {
    id: uuid(),
    name,
    ...rest,
    components: (components || []).map(ordCompoundToReactionCompound),
  };
}

export function reactionInputToOrdInput(appInput: AppReactionInput): ord.IReactionInput {
  const { components, id: _i, name: _n, ...rest } = appInput;
  return {
    ...rest,
    components: components.length > 0 ? components.map(reactionCompoundToOrdCompound) : null,
  };
}

export function ordInputsToReactionInputs(ordInputs: ord.IReaction['inputs']): AppReaction['inputs'] {
  return Object.entries(ordInputs || {}).reduce((acc, [name, ordInput]) => {
    const reactionInput = ordInputToReactionsInput(ordInput, name);
    return {
      ...acc,
      [reactionInput.id]: reactionInput,
    };
  }, {});
}

export function reactionInputsToOrdInputs(reactionInputs: AppReaction['inputs']): ord.IReaction['inputs'] {
  return Object.values(reactionInputs).reduce(
    (acc, item) => ({
      ...acc,
      [item.name]: reactionInputToOrdInput(item),
    }),
    {},
  );
}
