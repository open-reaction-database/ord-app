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
  ordScalarToReaction,
  ordTimeToReaction,
  reactionBooleanToOrd,
  reactionTimeToOrd,
  withId,
  withoutId,
} from '../reactionEntity/reactionEntity.converters.ts';
import type { MessageInitShape } from '@bufbuild/protobuf';
import type {
  ReactionWorkup as OrdReactionWorkup,
  ReactionWorkupSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import {
  ordWorkupTypeToReaction,
  reactionWorkupTypeToOrd,
} from '../reactionEntityTypes/reactionEntityTypes.converters.ts';
import {
  ordAmountToReaction,
  reactionAmountToOrd,
} from '../reactionAmount/reactionAmount.converters.ts';
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
import { workupTransform } from './reactionWorkups.transform.ts';

export const ordWorkupToReaction = ({
  type,
  duration,
  amount,
  input,
  temperature,
  stirring,
  isAutomated,
  details,
  keepPhase,
  targetPh,
}: OrdReactionWorkup): ReactionWorkup =>
  withId({
    type: ordWorkupTypeToReaction(type),
    duration: ordTimeToReaction(duration),
    amount: ordAmountToReaction(amount),
    input: input ? ordInputWithoutNameToReaction(input) : null,
    temperature: ordTemperatureConditionToReaction(temperature),
    stirring: ordStirringConditionToReaction(stirring),
    isAutomated: ordBooleanToReaction(isAutomated),
    details: ordScalarToReaction(details),
    keepPhase: ordScalarToReaction(keepPhase),
    targetPh,
  });

export const reactionWorkupToOrd = (
  workup: ReactionWorkup,
): MessageInitShape<typeof ReactionWorkupSchema> => {
  const {
    type,
    duration,
    amount,
    input,
    temperature,
    stirring,
    isAutomated,
    details,
    keepPhase,
    targetPh,
  } = withoutId(workupTransform(workup));

  return {
    type: reactionWorkupTypeToOrd(type),
    duration: reactionTimeToOrd(duration),
    amount: amount ? reactionAmountToOrd(amount) : undefined,
    input: input ? reactionInputWithoutNameToOrd(input) : undefined,
    temperature: temperature
      ? reactionTemperatureConditionToOrd(temperature)
      : undefined,
    stirring: stirring ? reactionStirringConditionToOrd(stirring) : undefined,
    isAutomated: reactionBooleanToOrd(isAutomated),
    details: details ?? undefined,
    keepPhase: keepPhase ?? undefined,
    targetPh: targetPh ?? undefined,
  };
};
