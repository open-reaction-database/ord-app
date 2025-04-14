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
import type {
  ReactionSetup,
  ReactionVessel,
  ReactionVesselMaterial,
  ReactionEnvironment,
  ReactionVesselPreparation,
  ReactionVesselAttachment,
} from './reactionSetup.types';
import {
  ordMaterialTypeToReaction,
  ordVesselTypeToReaction,
  reactionMaterialTypeToOrd,
  reactionVesselTypeToOrd,
  ordEnvironmentTypeToReaction,
  reactionEnvitonmentTypeToOrd,
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
  reactionBooleanToOrd,
} from '../reactionEntity/reactionEntity.converters';
import { ordDataMapToReactionDataMap, reactionDataMapToOrdDataMap } from '../reactionData/reactionData.converters.ts';

export const ordVesselSetupToReaction = (vessel: OrdOptional<ord.IVessel>): ReactionVessel => {
  const { type, details, material, volume, preparations, attachments } = vessel ?? {};
  return {
    details,
    type: ordVesselTypeToReaction(type),
    material: ordMaterialSetupToReaction(material),
    volume: ordVolumeConditionToReaction(volume),
    vesselPreparations: (preparations || []).map(ordVesselPreparationToReaction),
    vesselAttachments: (attachments || []).map(ordVesselAttachmentToReaction),
  };
};

export const reactionVesselSetupToOrd = ({
  type,
  details,
  material,
  volume,
  vesselPreparations,
  vesselAttachments,
}: ReactionVessel): ord.IVessel => {
  return {
    details,
    type: reactionVesselTypeToOrd(type),
    volume: reactionVolumeConditionToOrd(volume),
    material: reactionMaterialSetupToOrd(material),
    preparations: vesselPreparations.length > 0 ? vesselPreparations.map(reactionVesselPreparationToOrd) : null,
    attachments: vesselAttachments.length > 0 ? vesselAttachments.map(reactionVesselAttachmentToOrd) : null,
  };
};

export const ordVesselAttachmentToReaction = ({ type, details }: ord.IVesselAttachment): ReactionVesselAttachment =>
  withId({
    type: ordVesselAttachmentTypeToReaction(type),
    details,
  });

export const reactionVesselAttachmentToOrd = ({ type, details }: ReactionVesselAttachment): ord.IVesselAttachment => ({
  type: reactionVesselAttachmentTypeToOrd(type),
  details,
});

export const ordVesselPreparationToReaction = ({ type, details }: ord.IVesselPreparation): ReactionVesselPreparation =>
  withId({
    type: ordVesselPreparationsTypeToReaction(type),
    details,
  });

export const reactionVesselPreparationToOrd = ({
  type,
  details,
}: ReactionVesselPreparation): ord.IVesselPreparation => ({
  details,
  type: reactionVesselPreparationsTypeToOrd(type),
});

export const ordMaterialSetupToReaction = (material: OrdOptional<ord.IVesselMaterial>): ReactionVesselMaterial => {
  const { type, details } = material ?? {};
  return {
    details,
    type: ordMaterialTypeToReaction(type),
  };
};

export const reactionMaterialSetupToOrd = ({ type, details }: ReactionVesselMaterial): ord.IVesselMaterial => ({
  details,
  type: reactionMaterialTypeToOrd(type),
});

export const ordEnvironmentSetupToReaction = (
  environment: OrdOptional<ord.ReactionSetup.IReactionEnvironment>,
): ReactionEnvironment => {
  const { type, details } = environment ?? {};
  return {
    details,
    type: ordEnvironmentTypeToReaction(type),
  };
};

export const reactionEnvironmentSetupToOrd = ({
  type,
  details,
}: ReactionEnvironment): ord.ReactionSetup.IReactionEnvironment => ({
  details,
  type: reactionEnvitonmentTypeToOrd(type),
});

export const ordSetupToReactionSetup = (setup?: ord.IReactionSetup | null): ReactionSetup => {
  const { isAutomated, vessel, environment, automationPlatform, automationCode } = setup ?? {};
  return withId({
    isAutomated: ordBooleanToReaction(isAutomated),
    vessel: ordVesselSetupToReaction(vessel),
    environment: ordEnvironmentSetupToReaction(environment),
    automationPlatform,
    automationCode: automationCode ? ordDataMapToReactionDataMap(automationCode) : {},
  });
};

export const reactionSetupToOrdSetup = ({
  isAutomated,
  vessel,
  environment,
  automationPlatform,
  automationCode,
}: ReactionSetup): ord.IReactionSetup => {
  return {
    isAutomated: reactionBooleanToOrd(isAutomated),
    vessel: reactionVesselSetupToOrd(vessel),
    environment: reactionEnvironmentSetupToOrd(environment),
    automationPlatform,
    automationCode: reactionDataMapToOrdDataMap(automationCode),
  };
};
