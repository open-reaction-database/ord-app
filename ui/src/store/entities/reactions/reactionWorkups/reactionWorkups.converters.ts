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
import type { ReactionWorkup } from './reactionWorkups.types.ts';
import {
  ordBooleanToReaction,
  ordTimeToReaction,
  reactionBooleanToOrd,
  reactionTimeToOrd,
  withId,
  withoutId,
} from '../reactionEntity/reactionEntity.converters.ts';
import type { ord } from 'ord-schema-protobufjs';
import {
  ordWorkupTypeToReaction,
  reactionWorkupTypeToOrd,
} from '../reactionEntityTypes/reactionEntityTypes.converters.ts';
import { ordAmountToReaction, reactionAmountToOrd } from '../reactionAmount/reactionAmount.converters.ts';
import {
  ordInputToReactionInputWithoutName,
  reactionInputWithoutNameToOrd,
} from '../reactionsInputs/reactionsInputs.converters.ts';

export const ordWorkupToReaction = ({
  type,
  duration,
  amount,
  input,
  isAutomated,
  ...workup
}: ord.IReactionWorkup): ReactionWorkup =>
  withId({
    type: ordWorkupTypeToReaction(type),
    duration: ordTimeToReaction(duration),
    amount: ordAmountToReaction(amount),
    input: input ? ordInputToReactionInputWithoutName(input) : null,
    isAutomated: ordBooleanToReaction(isAutomated),
    ...workup,
  });

export const reactionWorkupToOrd = ({
  type,
  duration,
  amount,
  input,
  isAutomated,
  ...workup
}: ReactionWorkup): ord.IReactionWorkup =>
  withoutId({
    type: reactionWorkupTypeToOrd(type),
    duration: reactionTimeToOrd(duration),
    amount: reactionAmountToOrd(amount),
    input: input ? reactionInputWithoutNameToOrd(input) : null,
    isAutomated: reactionBooleanToOrd(isAutomated),
    ...workup,
  });
