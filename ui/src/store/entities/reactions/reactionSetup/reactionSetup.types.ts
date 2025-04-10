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
import type { ReactionBoolean, VolumeType } from '../reactionEntity/reactionEntity.types';
import type {
  ReactionEnvironmentType,
  ReactionVesselMaterialType,
  ReactionVesselType,
} from '../reactionEntityTypes/reactionEntityTypes.types';

export interface ReactionMaterialSetup extends Pick<ord.IVesselMaterial, 'details'> {
  type: ReactionVesselMaterialType;
}

export interface ReactionVesselSetup extends Pick<ord.IVessel, 'details'> {
  type: ReactionVesselType;
  material: ReactionMaterialSetup;
  volume: VolumeType;
}

export interface ReactionEnvironmentSetup extends Pick<ord.ReactionSetup.IReactionEnvironment, 'details'> {
  type: ReactionEnvironmentType;
}

export interface ReactionSetup {
  isAutomated: ReactionBoolean;
  vessel: ReactionVesselSetup;
  environment: ReactionEnvironmentSetup;
}
