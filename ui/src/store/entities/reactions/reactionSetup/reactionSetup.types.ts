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
  Optional,
  ReactionBoolean,
  ReactionEntity,
  ReactionEnvironment,
  VesselMaterial,
  Volume,
} from '../reactionEntity/reactionEntity.types';
import type {
  ReactionVesselPreparationType,
  ReactionVesselType,
  ReactionVesselAttachmentType,
} from '../reactionEntityTypes/reactionEntityTypes.types';
import type { AppData } from '../reactionData/reactionData.types.ts';

export interface ReactionSetup {
  automationPlatform?: Optional<string>;
  isAutomated: ReactionBoolean;
  vessel: ReactionVessel;
  environment: ReactionEnvironment;
  automationCode: Record<string, AppData>;
}

export interface ReactionVessel {
  details?: Optional<string>;
  type: ReactionVesselType;
  material: VesselMaterial;
  volume: Volume;
  vesselPreparations: Array<ReactionVesselPreparation>;
  vesselAttachments: Array<ReactionVesselAttachment>;
}

export interface ReactionVesselPreparation extends ReactionEntity {
  details?: Optional<string>;
  type: ReactionVesselPreparationType;
}

export interface ReactionVesselAttachment extends ReactionEntity {
  details?: Optional<string>;
  type: ReactionVesselAttachmentType;
}
