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
import type {
  Mass_MassUnit,
  Moles_MolesUnit,
  Volume_VolumeUnit,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import type {
  Optional,
  ReactionBoolean,
} from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';

export type AppAmountUnspecified = 'UNSPECIFIED';

export type AppMolesUnit = Exclude<keyof typeof Moles_MolesUnit, AppAmountUnspecified>;

export type AppMassUnit = Exclude<keyof typeof Mass_MassUnit, AppAmountUnspecified>;

export type AppVolumeUnit = Exclude<
  keyof typeof Volume_VolumeUnit,
  AppAmountUnspecified
>;

export type ReactionAmountType =
  | AppMolesUnit
  | AppMassUnit
  | AppVolumeUnit
  | AppAmountUnspecified;

export interface ReactionAmount {
  value?: Optional<number>;
  precision?: Optional<number>;
  volumeIncludesSolutes: ReactionBoolean;
  units: ReactionAmountType;
}
