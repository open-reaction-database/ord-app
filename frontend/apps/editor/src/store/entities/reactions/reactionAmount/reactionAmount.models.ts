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
import {
  Mass_MassUnitSchema,
  Moles_MolesUnitSchema,
  Volume_VolumeUnitSchema,
  type Mass_MassUnit,
  type Moles_MolesUnit,
  type Volume_VolumeUnit,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { reversePrimitiveRecord } from 'common/utils/reversePrimitiveRecord.ts';
import { enumValueByName } from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.models.ts';
import type { AppAmountUnitUnspecified } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import type { AppAmountUnspecified } from 'store/entities/reactions/reactionAmount/reactionAmount.types.ts';
import type { SelectOptions } from 'common/types/selectOptions.ts';

export const appAmountUnspecified: AppAmountUnspecified = 'UNSPECIFIED';

const withoutUnspecified = <T extends AppAmountUnitUnspecified>(
  record: T,
): Omit<T, 'UNSPECIFIED'> => {
  const { UNSPECIFIED: _, ...rest } = record;
  return rest;
};

const molesUnitByName = withoutUnspecified(
  enumValueByName<keyof typeof Moles_MolesUnit>(Moles_MolesUnitSchema),
);
const massUnitByName = withoutUnspecified(
  enumValueByName<keyof typeof Mass_MassUnit>(Mass_MassUnitSchema),
);
const volumeUnitByName = withoutUnspecified(
  enumValueByName<keyof typeof Volume_VolumeUnit>(Volume_VolumeUnitSchema),
);

export const unitValueByName = {
  ...molesUnitByName,
  ...massUnitByName,
  ...volumeUnitByName,
};

export const molesUnitNames = Object.keys(molesUnitByName);
export const massUnitNames = Object.keys(massUnitByName);
export const volumeUnitNames = Object.keys(volumeUnitByName);

export const molesUnitByValue = reversePrimitiveRecord(molesUnitByName);
export const massUnitByValue = reversePrimitiveRecord(massUnitByName);
export const volumeUnitByValue = reversePrimitiveRecord(volumeUnitByName);

export const amountTypeOptions: SelectOptions = [
  appAmountUnspecified,
  {
    group: 'Mass',
    items: massUnitNames,
  },
  {
    group: 'Moles',
    items: molesUnitNames,
  },
  {
    group: 'Volume',
    items: volumeUnitNames,
  },
];
