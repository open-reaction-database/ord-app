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
import type { UniqueEntity } from 'store/utils/UniqueEntity.ts';
import type { AppData } from 'store/entities/reactions/reactionData/reactionData.types.ts';

export type AppAmountUnspecified = 'UNSPECIFIED';

export type AppMolesUnit = Exclude<keyof typeof ord.Moles.MolesUnit, AppAmountUnspecified>;
export type AppMassUnit = Exclude<keyof typeof ord.Mass.MassUnit, AppAmountUnspecified>;
export type AppVolumeUnit = Exclude<keyof typeof ord.Volume.VolumeUnit, AppAmountUnspecified>;

export type AppReactionAmountType = AppMolesUnit | AppMassUnit | AppVolumeUnit | AppAmountUnspecified;

export interface AppReactionAmount extends Pick<NonNullable<Required<ord.IAmount>['mass']>, 'value' | 'precision'> {
  units: AppReactionAmountType;
}

export interface AppReactionCompound extends Omit<ord.ICompound, 'amount' | 'features'> {
  features: Record<string, AppData>;
  amount: AppReactionAmount;
}

export interface AppReactionInput extends Omit<ord.IReactionInput, 'components'>, UniqueEntity {
  components: Array<AppReactionCompound>;
}

export interface AppAmountUnitUnspecified {
  UNSPECIFIED: number;
}
