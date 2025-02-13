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
import { ord } from 'ord-schema-protobufjs';
import { reversePrimitiveRecord } from 'common/utils/reversePrimitiveRecord.ts';
import type {
  AppAmountUnitUnspecified,
  AppAmountUnspecified,
  AppMassUnit,
  AppMolesUnit,
  AppVolumeUnit,
} from './reactionInputs.types.ts';

export const appAmountUnspecified: AppAmountUnspecified = 'UNSPECIFIED';

const withoutUnspecified = <T extends AppAmountUnitUnspecified>(record: T): Omit<T, 'UNSPECIFIED'> => {
  const { UNSPECIFIED: _, ...rest } = record;
  return rest;
};

// Sadly typescript do not want to properly infer type of enum
const molesUnitByName = withoutUnspecified(ord.Moles.MolesUnit) as Record<AppMolesUnit, number>;
const massUnitByName = withoutUnspecified(ord.Mass.MassUnit) as Record<AppMassUnit, number>;
const volumeUnitByName = withoutUnspecified(ord.Volume.VolumeUnit) as Record<AppVolumeUnit, number>;

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
