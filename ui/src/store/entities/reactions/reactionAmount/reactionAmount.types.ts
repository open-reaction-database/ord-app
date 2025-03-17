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
import type { ReactionBoolean } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';

export type AppAmountUnspecified = 'UNSPECIFIED';

export type AppMolesUnit = Exclude<keyof typeof ord.Moles.MolesUnit, AppAmountUnspecified>;

export type AppMassUnit = Exclude<keyof typeof ord.Mass.MassUnit, AppAmountUnspecified>;

export type AppVolumeUnit = Exclude<keyof typeof ord.Volume.VolumeUnit, AppAmountUnspecified>;

export type ReactionAmountType = AppMolesUnit | AppMassUnit | AppVolumeUnit | AppAmountUnspecified;

type ReactionAmountValuePrecision = Pick<NonNullable<Required<ord.IAmount>['mass']>, 'value' | 'precision'>;

export interface ReactionAmount extends ReactionAmountValuePrecision {
  volumeIncludesSolutes: ReactionBoolean;
  units: ReactionAmountType;
}
