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
import type {
  ReactionAdditionDevice,
  ReactionFlowRate,
  ReactionSpeed,
  ReactionTemperature,
  ReactionTexture,
  ReactionTime,
  WithId,
} from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import type { AppReactionAmount } from 'store/entities/reactions/reactionAmount/reactionAmount.types.ts';
import type { ReactionCompoundIdentifier } from 'store/entities/reactions/reactionCompoundIdentifier/reactionCompoundIdentifiers.types.ts';
import type {
  CompoundPreparationType,
  ReactionRole,
} from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.types.ts';

export interface AppCompoundPreparation extends WithId<Omit<ord.ICompoundPreparation, 'type'>> {
  type: CompoundPreparationType;
}

export interface AppReactionCompound
  extends WithId<Omit<ord.ICompound, 'amount' | 'features' | 'identifiers' | 'reactionRole' | 'preparations'>> {
  reactionRole: ReactionRole;
  features: Record<string, AppData>;
  preparations: Array<AppCompoundPreparation>;
  amount: AppReactionAmount;
  identifiers: Array<ReactionCompoundIdentifier>;
  molBlockIdentifiers: Array<ReactionCompoundIdentifier>;
}

export interface AppReactionInput
  extends Omit<
      ord.IReactionInput,
      | 'components'
      | 'additionTime'
      | 'additionSpeed'
      | 'additionDuration'
      | 'flowRate'
      | 'additionDevice'
      | 'additionTemperature'
      | 'texture'
    >,
    UniqueEntity {
  components: Array<AppReactionCompound>;
  additionDuration: ReactionTime;
  additionTime: ReactionTime;
  additionSpeed: ReactionSpeed;
  flowRate: ReactionFlowRate;
  additionDevice: ReactionAdditionDevice;
  additionTemperature: ReactionTemperature;
  texture: ReactionTexture;
}

export interface AppAmountUnitUnspecified {
  UNSPECIFIED: number;
}
