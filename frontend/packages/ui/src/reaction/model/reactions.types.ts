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
import type { ReactionPathComponents } from './reactionPathComponents.ts';
import type { ReactionInput } from '#reaction/model/reactionsInputs/reactionInputs.types.ts';
import type {
  ComponentProductPreview,
  PreviewsById,
} from '#reaction/previews/previews.types.ts';
import type { ReactionOutcome } from '#reaction/model/reactionsOutcomes/reactionOutcomes.types.ts';
import type {
  Optional,
  ReactionIdentifier,
  WithId,
  WithIdName,
} from '#reaction/model/reactionEntity/reactionEntity.types.ts';
import type { ReactionNotes } from '#reaction/model/reactionNotes/reactionNotes.types.ts';
import type { ReactionObservation } from '#reaction/model/reactionObservation/reactionObservation.converter.ts';
import type { ReactionProvenance } from '#reaction/model/reactionProvenance/reactionProvenance.types.ts';
import type { ReactionWorkup } from '#reaction/model/reactionWorkups/reactionWorkups.types.ts';
import type { ReactionConditions } from '#reaction/model/reactionConditions/reactionConditions.types.ts';
import type { ReactionSetup } from '#reaction/model/reactionSetup/reactionSetup.types.ts';
import type { DescMessage, MessageInitShape } from '@bufbuild/protobuf';

export enum ReactionNodeEntity {
  Inputs = 'inputs',
  Input = 'input',
  Outcomes = 'outcomes',
  Identifiers = 'identifiers',
  Setup = 'setup',
  Notes = 'notes',
  Components = 'components',
  CrudeComponents = 'crudeComponents',
  ComponentPreparations = 'preparations',
  Features = 'features',
  ComponentIdentifiers = 'component_identifiers',
  Analyses = 'analyses',
  Products = 'products',
  Measurements = 'measurements',
  Observations = 'observations',
  Provenance = 'provenance',
  RecordModified = 'recordModified',
  Conditions = 'conditions',
  Workups = 'workups',
  TemperatureMeasurements = 'temperatureMeasurements',
  ElectrochemistryMeasurements = 'electrochemistryMeasurements',
  PressureMeasurements = 'pressureMeasurements',
  VesselPreparations = 'vesselPreparations',
  VesselAttachments = 'vesselAttachments',
}

export interface OrdToReactionNamelessEntityConverter {
  hasName: false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  convert: (ordEntity: any) => WithId<any>;
}

export interface OrdToReactionNamedEntityConverter {
  hasName: true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  convert: (ordEntity: any, name: string) => WithIdName<any>;
}

export type OrdToReactionEntityConverter =
  | OrdToReactionNamelessEntityConverter
  | OrdToReactionNamedEntityConverter;

export type ReactionToOrdEntityConverter = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reactionEntity: any,
) => MessageInitShape<DescMessage> | undefined;

export interface ReactionSummary {
  provenance: Record<string, string | number>;
  summary: Record<string, string | number>;
  conditions: string;
}

export interface ErrorWarningMessageTextOnly {
  text: string;
}

export interface ErrorWarningMessageWithPath extends ErrorWarningMessageTextOnly {
  path: ReactionPathComponents;
  originalPath: string;
}

export type ErrorWarningMessage =
  | ErrorWarningMessageTextOnly
  | ErrorWarningMessageWithPath;

export interface OrdValidation {
  errors: Array<string>;
  warnings: Array<string>;
}

export interface ReactionValidation {
  errors: Array<ErrorWarningMessage>;
  warnings: Array<ErrorWarningMessage>;
}

interface ReactionMolBlockProducts {
  molblock: ComponentProductPreview;
  measurements: Array<{
    authentic_standard: { molblock: ComponentProductPreview };
  }>;
}

export interface ReactionMolBlocks {
  inputs: Record<string, Array<ComponentProductPreview>>;
  outcomes: Array<{ products: Array<ReactionMolBlockProducts> }>;
  workups: Array<Array<ComponentProductPreview>>;
}

export interface AppReaction {
  reactionId?: Optional<string>;
  inputs: Record<string, ReactionInput>;
  outcomes: Array<ReactionOutcome>;
  identifiers: Array<ReactionIdentifier>;
  setup: ReactionSetup;
  observations: Array<ReactionObservation>;
  conditions: ReactionConditions;
  notes: ReactionNotes;
  provenance: ReactionProvenance;
  workups: Array<ReactionWorkup>;
}

export interface ReactionResponse {
  id: number;
  pb_reaction_id: string;
  is_valid: boolean;
  summary: ReactionSummary;
  validation: Optional<OrdValidation>;
  binpb: string;
  molblocks: ReactionMolBlocks;
}

export interface BaseReaction {
  data: AppReaction;
  previews: PreviewsById;
  summary: ReactionSummary;
  // The `data` the backend holds while optimistic field edits are unsaved, restored if a save of
  // them fails (e.g. the user's role was changed to viewer, or the backend is down). Transient:
  // present only while edits are unsaved, cleared when they are saved or rolled back. (#615)
  dataBeforeEdit?: AppReaction;
}

export interface DatasetReaction extends BaseReaction {
  id: number;
  pb_reaction_id: string;
  is_valid: boolean;
  validation: Optional<ReactionValidation>;
}

export type ReactionId = number | string;
