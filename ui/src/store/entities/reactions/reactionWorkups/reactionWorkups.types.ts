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
import type { Optional, ReactionBoolean, ReactionTime, WithId } from '../reactionEntity/reactionEntity.types.ts';
import type { WorkupType } from '../reactionEntityTypes/reactionEntityTypes.types.ts';
import type { ReactionInputWithoutName } from '../reactionsInputs/reactionInputs.types.ts';
import type { ReactionAmount } from '../reactionAmount/reactionAmount.types.ts';
import type {
  ReactionStirringCondition,
  ReactionTemperatureCondition,
} from '../reactionConditions/reactionConditions.types.ts';

export interface ReactionWorkup extends WithId<Pick<ord.IReactionWorkup, 'details' | 'keepPhase' | 'targetPh'>> {
  type: WorkupType;
  duration: ReactionTime;
  input: Optional<ReactionInputWithoutName>;
  amount: ReactionAmount;
  temperature: ReactionTemperatureCondition;
  stirring: ReactionStirringCondition;
  isAutomated: ReactionBoolean;
}
