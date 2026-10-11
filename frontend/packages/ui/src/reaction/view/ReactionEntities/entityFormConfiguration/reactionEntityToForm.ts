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
import { type ReactionFormNode } from '#reaction/view/ReactionEntities/reactionEntities.types.ts';
import { reactionNotes } from './reactionNotes.model.ts';
import { reactionData } from '#reaction/view/ReactionEntities/entityFormConfiguration/data/reactionData.models.tsx';
import {
  reactionInputs,
  reactionInputWithoutName,
} from '#reaction/view/ReactionEntities/entityFormConfiguration/inputs/reactionInputs.model.tsx';
import { reactionIdentifiers } from './reactionIdentifiers.ts';
import { reactionProvenance } from '#reaction/view/ReactionEntities/entityFormConfiguration/provenance/reactionProvenance.models.ts';
import { recordModified } from '#reaction/view/ReactionEntities/entityFormConfiguration/provenance/recordModified.models.ts';
import { reactionComponents } from '#reaction/view/ReactionEntities/entityFormConfiguration/components/reactionComponents.model.tsx';
import { reactionComponentsPreparations } from '#reaction/view/ReactionEntities/entityFormConfiguration/components/preparations/reactionComponentsPreparations.model.ts';
import { reactionComponentIdentifiers } from '#reaction/view/ReactionEntities/entityFormConfiguration/componentIdentifier/reactionComponentIdentifiers.model.ts';
import { reactionOutcomes } from '#reaction/view/ReactionEntities/entityFormConfiguration/outcomes/reactionOutcomes.models.ts';
import { reactionAnalyses } from '#reaction/view/ReactionEntities/entityFormConfiguration/outcomes/reactionAnalyses.models.ts';
import { reactionProducts } from '#reaction/view/ReactionEntities/entityFormConfiguration/components/reactionProducts.model.ts';
import { reactionMeasurements } from '#reaction/view/ReactionEntities/entityFormConfiguration/measurements/reactionMeasurements.model.ts';
import { reactionCrudeComponents } from '#reaction/view/ReactionEntities/entityFormConfiguration/components/reactionCrudeComponents.model.ts';
import { ReactionNodeEntity } from '#reaction/model/reactions.types.ts';
import { reactionObservations } from './reactionObservations.model.tsx';
import { reactionConditions } from './reactionConditions.model.tsx';
import { reactionWorkups } from '#reaction/view/ReactionEntities/entityFormConfiguration/workups/reactionWorkups.models.ts';
import { reactionTemperatureMeasurements } from '#reaction/view/ReactionEntities/entityFormConfiguration/conditionsMeasurements/reactionTemperatureMeasurements.models.ts';
import { reactionElectrochemistryMeasurements } from '#reaction/view/ReactionEntities/entityFormConfiguration/conditionsMeasurements/reactionElectrochemistryMeasurements.ts';
import { reactionPressureMeasurements } from '#reaction/view/ReactionEntities/entityFormConfiguration/conditionsMeasurements/reactionPressureMeasurements.model.ts';
import { reactionSetup } from '#reaction/view/ReactionEntities/entityFormConfiguration/setup/reactionSetup.model.ts';
import { reactionVesselPreparations } from '#reaction/view/ReactionEntities/entityFormConfiguration/setup/reactionPreparationSetup.model.ts';
import { reactionVesselAttachments } from '#reaction/view/ReactionEntities/entityFormConfiguration/setup/reactionAttachmentSetup.model.ts';

export const reactionEntityToForm: Record<
  ReactionNodeEntity,
  Array<ReactionFormNode>
> = {
  [ReactionNodeEntity.Inputs]: reactionInputs,
  [ReactionNodeEntity.Input]: reactionInputWithoutName,
  [ReactionNodeEntity.Notes]: reactionNotes,
  [ReactionNodeEntity.Identifiers]: reactionIdentifiers,
  [ReactionNodeEntity.Setup]: reactionSetup,
  [ReactionNodeEntity.Components]: reactionComponents,
  [ReactionNodeEntity.ComponentPreparations]: reactionComponentsPreparations,
  [ReactionNodeEntity.Features]: reactionData,
  [ReactionNodeEntity.ComponentIdentifiers]: reactionComponentIdentifiers,
  [ReactionNodeEntity.Outcomes]: reactionOutcomes,
  [ReactionNodeEntity.Analyses]: reactionAnalyses,
  [ReactionNodeEntity.Products]: reactionProducts,
  [ReactionNodeEntity.Measurements]: reactionMeasurements,
  [ReactionNodeEntity.CrudeComponents]: reactionCrudeComponents,
  [ReactionNodeEntity.Observations]: reactionObservations,
  [ReactionNodeEntity.Provenance]: reactionProvenance,
  [ReactionNodeEntity.RecordModified]: recordModified,
  [ReactionNodeEntity.Conditions]: reactionConditions,
  [ReactionNodeEntity.Workups]: reactionWorkups,
  [ReactionNodeEntity.TemperatureMeasurements]: reactionTemperatureMeasurements,
  [ReactionNodeEntity.ElectrochemistryMeasurements]:
    reactionElectrochemistryMeasurements,
  [ReactionNodeEntity.PressureMeasurements]: reactionPressureMeasurements,
  [ReactionNodeEntity.VesselPreparations]: reactionVesselPreparations,
  [ReactionNodeEntity.VesselAttachments]: reactionVesselAttachments,
};
