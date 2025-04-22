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
  ordInputWithoutNameToReaction,
  reactionInputWithoutNameToOrd,
} from '../reactionsInputs/reactionsInputs.converters.ts';
import {
  ordStirringConditionToReaction,
  ordTemperatureConditionToReaction,
  reactionStirringConditionToOrd,
  reactionTemperatureConditionToOrd,
} from '../reactionConditions/reactionConditions.converter.ts';
import { workupTransform } from './reactionWorkups.tranform.ts';

export const ordWorkupToReaction = ({
  type,
  duration,
  amount,
  input,
  temperature,
  stirring,
  isAutomated,
  ...workup
}: ord.IReactionWorkup): ReactionWorkup =>
  withId({
    type: ordWorkupTypeToReaction(type),
    duration: ordTimeToReaction(duration),
    amount: ordAmountToReaction(amount),
    input: input ? ordInputWithoutNameToReaction(input) : null,
    temperature: ordTemperatureConditionToReaction(temperature),
    stirring: ordStirringConditionToReaction(stirring),
    isAutomated: ordBooleanToReaction(isAutomated),
    ...workup,
  });

export const reactionWorkupToOrd = (workup: ReactionWorkup): ord.IReactionWorkup => {
  const { type, duration, amount, input, temperature, stirring, isAutomated, ...rest } = withoutId(
    workupTransform(workup),
  );

  return {
    type: reactionWorkupTypeToOrd(type),
    duration: reactionTimeToOrd(duration),
    amount: amount ? reactionAmountToOrd(amount) : amount,
    input: input ? reactionInputWithoutNameToOrd(input) : null,
    temperature: temperature ? reactionTemperatureConditionToOrd(temperature) : temperature,
    stirring: stirring ? reactionStirringConditionToOrd(stirring) : stirring,
    isAutomated: reactionBooleanToOrd(isAutomated),
    ...rest,
  };
};
