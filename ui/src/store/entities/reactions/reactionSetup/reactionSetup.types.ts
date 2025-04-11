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
import type { ReactionBoolean, Volume, WithId } from '../reactionEntity/reactionEntity.types';
import type {
  ReactionEnvironmentType,
  ReactionVesselMaterialType,
  ReactionVesselPreparationType,
  ReactionVesselType,
  ReactionVesselAttachmentType,
} from '../reactionEntityTypes/reactionEntityTypes.types';
import type { AppData } from '../reactionData/reactionData.types.ts';

export interface ReactionSetup extends Pick<ord.IReactionSetup, 'automationPlatform'> {
  isAutomated: ReactionBoolean;
  vessel: ReactionVessel;
  environment: ReactionEnvironment;
  automationCode: Record<string, AppData>;
}

export interface ReactionVessel extends Pick<ord.IVessel, 'details'> {
  type: ReactionVesselType;
  material: ReactionVesselMaterial;
  volume: Volume;
  vesselPreparations: Array<ReactionVesselPreparation>;
  vesselAttachments: Array<ReactionVesselAttachment>;
}
export interface ReactionVesselMaterial extends Pick<ord.IVesselMaterial, 'details'> {
  type: ReactionVesselMaterialType;
}

export interface ReactionVesselPreparation extends WithId<Pick<ord.IVesselPreparation, 'details'>> {
  type: ReactionVesselPreparationType;
}

export interface ReactionVesselAttachment extends WithId<Pick<ord.IVesselAttachment, 'details'>> {
  type: ReactionVesselAttachmentType;
}

export interface ReactionEnvironment extends Pick<ord.ReactionSetup.IReactionEnvironment, 'details'> {
  type: ReactionEnvironmentType;
}
