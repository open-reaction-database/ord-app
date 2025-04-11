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
  ReactionVesselSetup,
  ReactionMaterialSetup,
  ReactionEnvironmentSetup,
  ReactionPreparationSetup,
  VesselAttachment,
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

export const ordVesselSetupToReaction = (vessel: OrdOptional<ord.IVessel>): ReactionVesselSetup => {
  const { type, details, material, volume, preparations, attachments } = vessel ?? {};
  return {
    details,
    type: ordVesselTypeToReaction(type),
    material: ordMaterialSetupToReaction(material),
    volume: ordVolumeConditionToReaction(volume),
    preparations: (preparations || []).map(ordPreparationSetupToReaction),
    attachments: (attachments || []).map(ordVesselAttachmentToReaction),
  };
};

export const reactionVesselSetupToOrd = ({
  type,
  details,
  material,
  volume,
  preparations,
  attachments,
}: ReactionVesselSetup): ord.IVessel => {
  const attachmentsOrd: Array<ord.IVesselAttachment> | null = [reactionVesselAttachmentToOrd(attachments[0])];

  return {
    details,
    type: reactionVesselTypeToOrd(type),
    volume: reactionVolumeConditionToOrd(volume),
    material: reactionMaterialSetupToOrd(material),
    preparations: preparations.length > 0 ? preparations.map(reactionPreparationSetupToOrd) : null,
    attachments: attachmentsOrd,
  };
};

export const ordVesselAttachmentToReaction = ({ type, details }: ord.IVesselAttachment): VesselAttachment =>
  withId({
    type: ordVesselAttachmentTypeToReaction(type),
    details,
  });

export const reactionVesselAttachmentToOrd = ({ type, details }: VesselAttachment): ord.IVesselAttachment => ({
  type: reactionVesselAttachmentTypeToOrd(type),
  details,
});

export const ordPreparationSetupToReaction = ({ type, details }: ord.IVesselPreparation): ReactionPreparationSetup =>
  withId({
    type: ordVesselPreparationsTypeToReaction(type),
    details,
  });

export const reactionPreparationSetupToOrd = ({ type, details }: ReactionPreparationSetup): ord.IVesselPreparation => ({
  details,
  type: reactionVesselPreparationsTypeToOrd(type),
});

export const ordMaterialSetupToReaction = (material: OrdOptional<ord.IVesselMaterial>): ReactionMaterialSetup => {
  const { type, details } = material ?? {};
  return {
    details,
    type: ordMaterialTypeToReaction(type),
  };
};

export const reactionMaterialSetupToOrd = ({ type, details }: ReactionMaterialSetup): ord.IVesselMaterial => ({
  details,
  type: reactionMaterialTypeToOrd(type),
});

export const ordEnvironmentSetupToReaction = (
  environment: OrdOptional<ord.ReactionSetup.IReactionEnvironment>,
): ReactionEnvironmentSetup => {
  const { type, details } = environment ?? {};
  return {
    details,
    type: ordEnvironmentTypeToReaction(type),
  };
};

export const reactionEnvironmentSetupToOrd = ({
  type,
  details,
}: ReactionEnvironmentSetup): ord.ReactionSetup.IReactionEnvironment => ({
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
