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
import {
  ReactionNodeEntity,
  type OrdToReactionEntityConverter,
  type ReactionToOrdEntityConverter,
} from './reactions.types.ts';
import {
  ordCrudeComponentToReaction,
  ordInputWithoutNameToReaction,
  ordInputToReaction,
  reactionInputToOrd,
  reactionInputWithoutNameToOrd,
  reactionCrudeComponentToOrd,
} from './reactionsInputs/reactionsInputs.converters.ts';
import {
  ordAnalysisToReaction,
  ordOutcomeToReactionOutcome,
  reactionAnalysisToOrd,
  reactionOutcomeToOrd,
} from './reactionsOutcomes/reactionOutcomes.converters.ts';
import {
  ordCompoundIdentifierToReaction,
  ordReactionIdentifierToReaction,
  reactionCompoundIdentifierToOrd,
  reactionIdentifierToOrd,
} from './reactionEntity/reactionEntity.converters.ts';
import {
  ordSetupToReactionSetup,
  ordVesselPreparationToReaction,
  reactionSetupToOrd,
  reactionVesselAttachmentToOrd,
  reactionVesselPreparationToOrd,
} from './reactionSetup/reactionSetup.converter.ts';
import { ordNotesToReaction, reactionNotesToOrd } from './reactionNotes/reactionNotes.converters.ts';
import {
  ordInputComponentToReaction,
  ordMeasurementToReaction,
  ordPreparationToReaction,
  ordProductToReaction,
  reactionInputComponentToOrd,
  reactionMeasurementToOrd,
  reactionPreparationToOrd,
  reactionProductToOrd,
} from './reactionComponent/reactionComponent.converters.ts';
import { ordDataToReaction, reactionDataToOrd } from './reactionData/reactionData.converters.ts';
import {
  ordObservationToReaction,
  reactionObservationToOrd,
} from './reactionObservation/reactionObservation.converter.ts';
import {
  ordProvenanceToReaction,
  ordRecordEventToReaction,
  reactionProvenanceToOrd,
  reactionRecordEventToOrd,
} from './reactionProvenance/reactionProvenance.converters.ts';
import {
  ordConditionsToReaction,
  ordElectrochemistryMeasurementToReaction,
  ordPressureMeasurementToReaction,
  ordTemperatureMeasurementToReaction,
  reactionConditionsToOrd,
  reactionElectrochemistryMeasurementToOrd,
  reactionPressureMeasurementToOrd,
  reactionTemperatureMeasurementToOrd,
} from './reactionConditions/reactionConditions.converter.ts';
import { ordWorkupToReaction, reactionWorkupToOrd } from './reactionWorkups/reactionWorkups.converters.ts';

const additionalEntityNames = ['analysisData', 'authenticStandard', 'molBlockIdentifiers', 'automationCode'];

export const allowedNodeEntityNames: Array<string> = [...Object.values(ReactionNodeEntity), ...additionalEntityNames];

export const ordToReactionConvertersByNodeEntity: Record<ReactionNodeEntity, OrdToReactionEntityConverter> = {
  [ReactionNodeEntity.Inputs]: {
    hasName: true,
    convert: ordInputToReaction,
  },
  [ReactionNodeEntity.Input]: {
    hasName: false,
    convert: ordInputWithoutNameToReaction,
  },
  [ReactionNodeEntity.Outcomes]: {
    hasName: false,
    convert: ordOutcomeToReactionOutcome,
  },
  [ReactionNodeEntity.Identifiers]: {
    hasName: false,
    convert: ordReactionIdentifierToReaction,
  },
  [ReactionNodeEntity.Setup]: {
    hasName: false,
    convert: ordSetupToReactionSetup,
  },
  [ReactionNodeEntity.Notes]: {
    hasName: false,
    convert: ordNotesToReaction,
  },
  [ReactionNodeEntity.Components]: {
    hasName: false,
    convert: ordInputComponentToReaction,
  },
  [ReactionNodeEntity.CrudeComponents]: {
    hasName: false,
    convert: ordCrudeComponentToReaction,
  },
  [ReactionNodeEntity.ComponentPreparations]: {
    hasName: false,
    convert: ordPreparationToReaction,
  },
  [ReactionNodeEntity.Features]: {
    hasName: true,
    convert: ordDataToReaction,
  },
  [ReactionNodeEntity.ComponentIdentifiers]: {
    hasName: false,
    convert: ordCompoundIdentifierToReaction,
  },
  [ReactionNodeEntity.Analyses]: {
    hasName: true,
    convert: ordAnalysisToReaction,
  },
  [ReactionNodeEntity.Products]: {
    hasName: false,
    convert: ordProductToReaction,
  },
  [ReactionNodeEntity.Measurements]: {
    hasName: false,
    convert: ordMeasurementToReaction,
  },
  [ReactionNodeEntity.Observations]: {
    hasName: false,
    convert: ordObservationToReaction,
  },
  [ReactionNodeEntity.Provenance]: {
    hasName: false,
    convert: ordProvenanceToReaction,
  },
  [ReactionNodeEntity.RecordModified]: {
    hasName: false,
    convert: ordRecordEventToReaction,
  },
  [ReactionNodeEntity.Conditions]: {
    hasName: false,
    convert: ordConditionsToReaction,
  },
  [ReactionNodeEntity.Workups]: {
    hasName: false,
    convert: ordWorkupToReaction,
  },
  [ReactionNodeEntity.TemperatureMeasurements]: {
    hasName: false,
    convert: ordTemperatureMeasurementToReaction,
  },
  [ReactionNodeEntity.ElectrochemistryMeasurements]: {
    hasName: false,
    convert: ordElectrochemistryMeasurementToReaction,
  },
  [ReactionNodeEntity.PressureMeasurements]: {
    hasName: false,
    convert: ordPressureMeasurementToReaction,
  },
  [ReactionNodeEntity.VesselPreparations]: {
    hasName: false,
    convert: ordVesselPreparationToReaction,
  },
  [ReactionNodeEntity.VesselAttachments]: {
    hasName: false,
    convert: ordVesselPreparationToReaction,
  },
};

export const reactionToOrdConvertersByNodeEntity: Record<ReactionNodeEntity, ReactionToOrdEntityConverter> = {
  [ReactionNodeEntity.Inputs]: reactionInputToOrd,
  [ReactionNodeEntity.Input]: reactionInputWithoutNameToOrd,
  [ReactionNodeEntity.Outcomes]: reactionOutcomeToOrd,
  [ReactionNodeEntity.Identifiers]: reactionIdentifierToOrd,
  [ReactionNodeEntity.Setup]: reactionSetupToOrd,
  [ReactionNodeEntity.Notes]: reactionNotesToOrd,
  [ReactionNodeEntity.Components]: reactionInputComponentToOrd,
  [ReactionNodeEntity.CrudeComponents]: reactionCrudeComponentToOrd,
  [ReactionNodeEntity.ComponentPreparations]: reactionPreparationToOrd,
  [ReactionNodeEntity.Features]: reactionDataToOrd,
  [ReactionNodeEntity.ComponentIdentifiers]: reactionCompoundIdentifierToOrd,
  [ReactionNodeEntity.Analyses]: reactionAnalysisToOrd,
  [ReactionNodeEntity.Products]: reactionProductToOrd,
  [ReactionNodeEntity.Measurements]: reactionMeasurementToOrd,
  [ReactionNodeEntity.Observations]: reactionObservationToOrd,
  [ReactionNodeEntity.Provenance]: reactionProvenanceToOrd,
  [ReactionNodeEntity.RecordModified]: reactionRecordEventToOrd,
  [ReactionNodeEntity.Conditions]: reactionConditionsToOrd,
  [ReactionNodeEntity.Workups]: reactionWorkupToOrd,
  [ReactionNodeEntity.TemperatureMeasurements]: reactionTemperatureMeasurementToOrd,
  [ReactionNodeEntity.ElectrochemistryMeasurements]: reactionElectrochemistryMeasurementToOrd,
  [ReactionNodeEntity.PressureMeasurements]: reactionPressureMeasurementToOrd,
  [ReactionNodeEntity.VesselPreparations]: reactionVesselPreparationToOrd,
  [ReactionNodeEntity.VesselAttachments]: reactionVesselAttachmentToOrd,
};
