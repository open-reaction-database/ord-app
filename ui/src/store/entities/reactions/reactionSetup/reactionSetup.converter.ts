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
  ReactionSetup as OrdReactionSetup,
  ReactionSetupSchema,
  Vessel,
  VesselAttachment,
  VesselAttachmentSchema,
  VesselPreparation,
  VesselPreparationSchema,
  VesselSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import type {
  ReactionSetup,
  ReactionVessel,
  ReactionVesselPreparation,
  ReactionVesselAttachment,
} from './reactionSetup.types';
import {
  ordVesselTypeToReaction,
  reactionVesselTypeToOrd,
  ordVesselPreparationsTypeToReaction,
  reactionVesselPreparationsTypeToOrd,
  ordVesselAttachmentTypeToReaction,
  reactionVesselAttachmentTypeToOrd,
} from '../reactionEntityTypes/reactionEntityTypes.converters';
import type { OrdOptional } from '../reactionEntity/reactionEntity.types';
import {
  ordVolumeConditionToReaction,
  reactionVolumeConditionToOrd,
  withId,
  ordBooleanToReaction,
  ordScalarToReaction,
  reactionBooleanToOrd,
  ordVesselMaterialToReaction,
  reactionVesselMaterialToOrd,
  ordEnvironmentToReaction,
  reactionEnvironmentToOrd,
} from '../reactionEntity/reactionEntity.converters';
import {
  ordDataMapToReactionDataMap,
  reactionDataMapToOrdDataMap,
} from '../reactionData/reactionData.converters.ts';
import { convertObjectToUndefinedIfEmpty } from '../reactions.utils.ts';
import { setupTransform } from './reactionSetup.transform.ts';

export const ordVesselSetupToReaction = (
  vessel: OrdOptional<Vessel>,
): ReactionVessel => ({
  details: ordScalarToReaction(vessel?.details),
  type: ordVesselTypeToReaction(vessel?.type),
  material: ordVesselMaterialToReaction(vessel?.material),
  volume: ordVolumeConditionToReaction(vessel?.volume),
  vesselPreparations: (vessel?.preparations || []).map(ordVesselPreparationToReaction),
  vesselAttachments: (vessel?.attachments || []).map(ordVesselAttachmentToReaction),
});

export const reactionVesselSetupToOrd = ({
  type,
  details,
  material,
  volume,
  vesselPreparations,
  vesselAttachments,
}: ReactionVessel): MessageInitShape<typeof VesselSchema> | undefined => {
  return convertObjectToUndefinedIfEmpty(
    {
      details: details ?? undefined,
      type: reactionVesselTypeToOrd(type),
      volume: reactionVolumeConditionToOrd(volume),
      material: reactionVesselMaterialToOrd(material),
      preparations:
        vesselPreparations.length > 0
          ? vesselPreparations.map(reactionVesselPreparationToOrd)
          : undefined,
      attachments:
        vesselAttachments.length > 0
          ? vesselAttachments.map(reactionVesselAttachmentToOrd)
          : undefined,
    },
    ['type'],
  );
};

export const ordVesselAttachmentToReaction = ({
  type,
  details,
}: VesselAttachment): ReactionVesselAttachment =>
  withId({
    type: ordVesselAttachmentTypeToReaction(type),
    details: ordScalarToReaction(details),
  });

export const reactionVesselAttachmentToOrd = ({
  type,
  details,
}: ReactionVesselAttachment): MessageInitShape<typeof VesselAttachmentSchema> => ({
  type: reactionVesselAttachmentTypeToOrd(type),
  details: details ?? undefined,
});

export const ordVesselPreparationToReaction = ({
  type,
  details,
}: VesselPreparation): ReactionVesselPreparation =>
  withId({
    type: ordVesselPreparationsTypeToReaction(type),
    details: ordScalarToReaction(details),
  });

export const reactionVesselPreparationToOrd = ({
  type,
  details,
}: ReactionVesselPreparation): MessageInitShape<typeof VesselPreparationSchema> => ({
  details: details ?? undefined,
  type: reactionVesselPreparationsTypeToOrd(type),
});

export const ordSetupToReactionSetup = (
  setup?: OrdReactionSetup | null,
): ReactionSetup =>
  withId({
    isAutomated: ordBooleanToReaction(setup?.isAutomated),
    vessel: ordVesselSetupToReaction(setup?.vessel),
    environment: ordEnvironmentToReaction(setup?.environment),
    automationPlatform: ordScalarToReaction(setup?.automationPlatform),
    automationCode: ordDataMapToReactionDataMap(setup?.automationCode ?? {}),
  });

export const reactionSetupToOrd = (
  setup: ReactionSetup,
): MessageInitShape<typeof ReactionSetupSchema> | undefined => {
  const { isAutomated, vessel, environment, automationPlatform, automationCode } =
    setupTransform(setup);
  return convertObjectToUndefinedIfEmpty({
    isAutomated: reactionBooleanToOrd(isAutomated),
    vessel: reactionVesselSetupToOrd(vessel),
    environment: reactionEnvironmentToOrd(environment),
    automationPlatform: automationPlatform ?? undefined,
    automationCode: reactionDataMapToOrdDataMap(automationCode),
  });
};
