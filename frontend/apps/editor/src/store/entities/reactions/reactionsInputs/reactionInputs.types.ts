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
  ReactionAdditionDevice,
  ReactionBoolean,
  ReactionFlowRate,
  ReactionSpeed,
  ReactionTemperature,
  ReactionTexture,
  ReactionTime,
  ReactionEntity,
  ReactionNamedEntity,
} from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import type { ReactionInputComponent } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import type { ReactionAmount } from 'store/entities/reactions/reactionAmount/reactionAmount.types.ts';

export interface ReactionCrudeComponent extends ReactionEntity {
  reactionId?: Optional<string>;
  includesWorkup: ReactionBoolean;
  hasDerivedAmount: ReactionBoolean;
  amount: ReactionAmount;
  texture: ReactionTexture;
}

export interface ReactionInput extends ReactionNamedEntity {
  additionOrder?: Optional<number>;
  crudeComponents: Array<ReactionCrudeComponent>;
  components: Array<ReactionInputComponent>;
  additionDuration: ReactionTime;
  additionTime: ReactionTime;
  additionSpeed: ReactionSpeed;
  flowRate: ReactionFlowRate;
  additionDevice: ReactionAdditionDevice;
  additionTemperature: ReactionTemperature;
  texture: ReactionTexture;
}

export type ReactionInputWithoutName = Omit<ReactionInput, 'name'>;

export interface AppAmountUnitUnspecified {
  UNSPECIFIED: number;
}
