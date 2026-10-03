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
import type { MessageInitShape } from '@bufbuild/protobuf';
import type {
  CrudeComponent,
  CrudeComponentSchema,
  ReactionInput as OrdReactionInput,
  ReactionInputSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import type {
  ReactionInput,
  ReactionCrudeComponent,
  ReactionInputWithoutName,
} from './reactionInputs.types.ts';
import type { AppReaction } from 'store/entities/reactions/reactions.types.ts';
import {
  ordAdditionDeviceToReaction,
  ordAdditionSpeedToReaction,
  ordBooleanToReaction,
  ordFlowRateToReaction,
  ordScalarToReaction,
  ordTemperatureToReaction,
  ordTextureToReaction,
  ordTimeToReaction,
  reactionAdditionDeviceToOrd,
  reactionAdditionSpeedToOrd,
  reactionBooleanToOrd,
  reactionFlowRateToOrd,
  reactionTemperatureToOrd,
  reactionTextureToOrd,
  reactionTimeToOrd,
  withId,
  withoutId,
} from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import {
  ordInputComponentToReaction,
  reactionInputComponentToOrd,
} from 'store/entities/reactions/reactionComponent/reactionComponent.converters.ts';
import {
  ordAmountToReaction,
  reactionAmountToOrd,
} from 'store/entities/reactions/reactionAmount/reactionAmount.converters.ts';

export function ordCrudeComponentToReaction({
  reactionId,
  includesWorkup,
  hasDerivedAmount,
  texture,
  amount,
}: CrudeComponent): ReactionCrudeComponent {
  return withId({
    reactionId: ordScalarToReaction(reactionId),
    includesWorkup: ordBooleanToReaction(includesWorkup),
    hasDerivedAmount: ordBooleanToReaction(hasDerivedAmount),
    texture: ordTextureToReaction(texture),
    amount: ordAmountToReaction(amount),
  });
}

export function reactionCrudeComponentToOrd({
  reactionId,
  includesWorkup,
  hasDerivedAmount,
  amount,
  texture,
}: ReactionCrudeComponent): MessageInitShape<typeof CrudeComponentSchema> {
  return {
    reactionId: reactionId ?? undefined,
    includesWorkup: reactionBooleanToOrd(includesWorkup),
    hasDerivedAmount: reactionBooleanToOrd(hasDerivedAmount),
    amount: reactionAmountToOrd(amount),
    texture: reactionTextureToOrd(texture),
  };
}

export function ordInputWithoutNameToReaction(
  ordInput: OrdReactionInput,
): ReactionInputWithoutName {
  const {
    components,
    additionDuration,
    additionTime,
    additionDevice,
    additionSpeed,
    flowRate,
    texture,
    additionTemperature,
    additionOrder,
    crudeComponents,
  } = ordInput;
  return withId({
    components: (components || []).map(ordInputComponentToReaction),
    crudeComponents: (crudeComponents || []).map(ordCrudeComponentToReaction),
    additionOrder: ordScalarToReaction(additionOrder),
    additionSpeed: ordAdditionSpeedToReaction(additionSpeed),
    additionDuration: ordTimeToReaction(additionDuration),
    flowRate: ordFlowRateToReaction(flowRate),
    additionDevice: ordAdditionDeviceToReaction(additionDevice),
    additionTime: ordTimeToReaction(additionTime),
    additionTemperature: ordTemperatureToReaction(additionTemperature),
    texture: ordTextureToReaction(texture),
  });
}

export function reactionInputWithoutNameToOrd(
  input: ReactionInputWithoutName,
): MessageInitShape<typeof ReactionInputSchema> {
  const {
    components,
    crudeComponents,
    additionOrder,
    additionSpeed,
    additionDuration,
    flowRate,
    additionDevice,
    additionTime,
    additionTemperature,
    texture,
  } = withoutId(input);
  return {
    components: components.map(reactionInputComponentToOrd),
    crudeComponents: crudeComponents.map(reactionCrudeComponentToOrd),
    additionOrder: additionOrder ?? undefined,
    additionSpeed: reactionAdditionSpeedToOrd(additionSpeed),
    additionDuration: reactionTimeToOrd(additionDuration),
    flowRate: reactionFlowRateToOrd(flowRate),
    additionDevice: reactionAdditionDeviceToOrd(additionDevice),
    additionTime: reactionTimeToOrd(additionTime),
    additionTemperature: reactionTemperatureToOrd(additionTemperature),
    texture: reactionTextureToOrd(texture),
  };
}

export function ordInputToReaction(
  ordInput: OrdReactionInput,
  name: string,
): ReactionInput {
  return {
    name,
    ...ordInputWithoutNameToReaction(ordInput),
  };
}

export function reactionInputToOrd({
  name: _,
  ...input
}: ReactionInput): MessageInitShape<typeof ReactionInputSchema> {
  return reactionInputWithoutNameToOrd(input);
}

export function ordInputsToReactionInputs(
  ordInputs: Record<string, OrdReactionInput>,
): AppReaction['inputs'] {
  return Object.entries(ordInputs || {}).reduce((acc, [name, ordInput]) => {
    const reactionInput = ordInputToReaction(ordInput, name);
    return {
      ...acc,
      [reactionInput.id]: reactionInput,
    };
  }, {});
}

export function reactionInputsToOrdInputs(
  reactionInputs: AppReaction['inputs'],
): Record<string, MessageInitShape<typeof ReactionInputSchema>> {
  return Object.values(reactionInputs).reduce(
    (acc, item) => ({
      ...acc,
      [item.name]: reactionInputToOrd(item),
    }),
    {},
  );
}
