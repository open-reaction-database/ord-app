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
import type { ReactionSidebarInfo } from './sidebarInfo.types.ts';
import { buildUseInitialValues } from 'features/reactions/ReactionEntities/sidebarInfo/buildUseInitialValues.ts';
import type { ord } from 'ord-schema-protobufjs';
import type { ReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import type {
  ReactionAnalysis,
  ReactionOutcome,
} from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.types.ts';
import type {
  ReactionInputComponent,
  ReactionMeasurement,
  ReactionProduct,
} from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { ReactionNodeEntity } from 'store/entities/reactions/reactions.types.ts';
import type { ReactionProvenance } from 'store/entities/reactions/reactionProvenance/reactionProvenance.types.ts';
import { createReactionEntityTitle } from '../ReactionEntityTitle/reactionEntityTitle.utils.tsx';
import type { ReactionWorkup } from 'store/entities/reactions/reactionWorkups/reactionWorkups.types.ts';
import type {
  ReactionConditions,
  ReactionTemperatureCondition,
} from 'store/entities/reactions/reactionConditions/reactionConditions.types.ts';
import type { ReactionSetup } from 'store/entities/reactions/reactionSetup/reactionSetup.types.ts';

const withoutNestedArray = <T extends object, K extends keyof T>(object: T, name: K): Omit<T, K> => {
  const { [name]: _, ...rest } = object;
  return rest;
};

type SidebarInfoPathLess = Omit<ReactionSidebarInfo, 'pathComponents'>;

const componentSidebarInfo: Omit<SidebarInfoPathLess, 'label' | 'sidebarTitle'> = {
  entityName: ReactionNodeEntity.Components,
  useInitialValues: buildUseInitialValues(
    ({ identifiers: _i, molBlockIdentifiers: _m, features: _f, preparations: _p, ...rest }: ReactionInputComponent) =>
      rest,
  ),
};

const inputSidebarInfo: Omit<SidebarInfoPathLess, 'entityName'> = {
  label: 'Input',
  sidebarTitle: createReactionEntityTitle({
    entityName: 'Input',
    hasDelete: true,
    description: 'Reaction inputs include every chemical added to the reaction vessel',
  }),
  useInitialValues: buildUseInitialValues(
    ({ components: _c, crudeComponents: _crude, ...rest }: ReactionInput) => rest,
  ),
};

const featureSidebarInfo: SidebarInfoPathLess = {
  entityName: ReactionNodeEntity.Features,
  label: 'Features',
  sidebarTitle: createReactionEntityTitle({ entityName: 'Features', hasDelete: true }),
  useInitialValues: buildUseInitialValues(value => value),
};

const preparationsSidebarInfo: SidebarInfoPathLess = {
  entityName: ReactionNodeEntity.ComponentPreparations,
  label: 'Preparation',
  sidebarTitle: createReactionEntityTitle({ entityName: 'Preparation', hasDelete: true }),
  useInitialValues: buildUseInitialValues(value => value),
};

const componentIdentifiersSidebarInfo: SidebarInfoPathLess = {
  entityName: ReactionNodeEntity.ComponentIdentifiers,
  label: 'Identifiers',
  sidebarTitle: createReactionEntityTitle({ entityName: 'Identifier', hasDelete: true }),
  useInitialValues: buildUseInitialValues(value => value),
};

const componentsSidebars: Array<ReactionSidebarInfo> = [
  {
    pathComponents: ['components', 'input'],
    label: 'Component',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Component', hasDelete: true }),
    ...componentSidebarInfo,
  },
  {
    pathComponents: ['components', 'inputs'],
    label: 'Component',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Component', hasDelete: true }),
    ...componentSidebarInfo,
  },
  {
    pathComponents: ['crudeComponents', 'inputs'],
    label: 'Crude Component',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Crude Component', hasDelete: true }),
    entityName: ReactionNodeEntity.CrudeComponents,
    useInitialValues: buildUseInitialValues(values => values),
  },
  {
    pathComponents: ['authenticStandard'],
    label: 'Authentic Standard',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Authentic Standard', hasDelete: false }),
    ...componentSidebarInfo,
  },
  {
    pathComponents: ['features', 'components', 'inputs'],
    ...featureSidebarInfo,
  },
  {
    pathComponents: ['features', 'authenticStandard'],
    ...featureSidebarInfo,
  },
  {
    pathComponents: ['features', 'products', 'outcomes'],
    ...featureSidebarInfo,
  },
  {
    pathComponents: ['identifiers', 'components', 'inputs'],
    ...componentIdentifiersSidebarInfo,
  },
  {
    pathComponents: ['molBlockIdentifiers', 'components', 'inputs'],
    ...componentIdentifiersSidebarInfo,
  },
  {
    pathComponents: ['identifiers', 'authenticStandard'],
    ...componentIdentifiersSidebarInfo,
  },
  {
    pathComponents: ['molBlockIdentifiers', 'authenticStandard'],
    ...componentIdentifiersSidebarInfo,
  },
  {
    pathComponents: ['identifiers', 'products', 'outcomes'],
    ...componentIdentifiersSidebarInfo,
  },
  {
    pathComponents: ['molBlockIdentifiers', 'products', 'outcomes'],
    ...componentIdentifiersSidebarInfo,
  },
  {
    pathComponents: ['identifiers', 'components', 'input'],
    ...componentIdentifiersSidebarInfo,
  },
  {
    pathComponents: ['molBlockIdentifiers', 'components', 'input'],
    ...componentIdentifiersSidebarInfo,
  },
  {
    pathComponents: ['preparations', 'components', 'inputs'],
    ...preparationsSidebarInfo,
  },
  {
    pathComponents: ['preparations', 'authenticStandard'],
    ...preparationsSidebarInfo,
  },
  {
    pathComponents: ['products', 'outcomes'],
    entityName: ReactionNodeEntity.Products,
    label: 'Products',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Product', hasDelete: true }),
    useInitialValues: buildUseInitialValues(
      ({ measurements: _m, identifiers: _i, molBlockIdentifiers: _, features: _f, ...value }: ReactionProduct) => value,
    ),
  },
  {
    pathComponents: ['measurements', 'products', 'outcomes'],
    entityName: ReactionNodeEntity.Measurements,
    label: 'Measurements',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Measurement', hasDelete: true }),
    useInitialValues: buildUseInitialValues(({ authenticStandard: _, ...value }: ReactionMeasurement) => value),
  },
];

export const reactionSidebarInfo: Array<ReactionSidebarInfo> = [
  {
    pathComponents: ['notes'],
    entityName: ReactionNodeEntity.Notes,
    label: 'Notes',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Notes', hasDelete: false }),
    useInitialValues: buildUseInitialValues((values: ord.IReactionNotes) => values),
  },
  {
    pathComponents: ['inputs'],
    entityName: ReactionNodeEntity.Inputs,
    ...inputSidebarInfo,
  },
  {
    pathComponents: ['input'],
    entityName: ReactionNodeEntity.Input,
    ...inputSidebarInfo,
  },
  {
    pathComponents: ['identifiers'],
    entityName: ReactionNodeEntity.Identifiers,
    label: 'Identifier',
    sidebarTitle: createReactionEntityTitle({
      entityName: 'Identifier',
      hasDelete: false,
      description: 'Reaction identifiers define descriptions of the overall reaction',
    }),
    useInitialValues: buildUseInitialValues(value => value),
  },
  {
    pathComponents: ['provenance'],
    entityName: ReactionNodeEntity.Provenance,
    label: 'Provenance',
    sidebarTitle: createReactionEntityTitle({
      entityName: 'Provenance',
      hasDelete: false,
      description: 'Additional metadata about how this reaction was performed and originally reported',
    }),
    useInitialValues: buildUseInitialValues(({ recordModified: _, ...values }: ReactionProvenance) => values),
  },
  {
    pathComponents: ['recordModified', 'provenance'],
    entityName: ReactionNodeEntity.RecordModified,
    label: 'Record Modified',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Record Modified', hasDelete: true }),
    useInitialValues: buildUseInitialValues((value: ord.IRecordEvent) => value),
  },
  {
    pathComponents: ['outcomes'],
    entityName: ReactionNodeEntity.Outcomes,
    label: 'Outcomes',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Outcome', hasDelete: true }),
    useInitialValues: buildUseInitialValues(({ analyses: _a, products: _p, ...rest }: ReactionOutcome) => rest),
  },
  {
    pathComponents: ['analyses', 'outcomes'],
    entityName: ReactionNodeEntity.Analyses,
    label: 'Analyses',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Analysis', hasDelete: true }),
    useInitialValues: buildUseInitialValues(({ analysisData: _, ...rest }: ReactionAnalysis) => rest),
  },
  {
    pathComponents: ['analysisData', 'analyses', 'outcomes'],
    entityName: ReactionNodeEntity.Features,
    label: 'Analytical Data',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Analytical Data', hasDelete: true }),
    useInitialValues: buildUseInitialValues(value => value),
  },
  {
    pathComponents: ['observations'],
    entityName: ReactionNodeEntity.Observations,
    label: 'Observations',
    sidebarTitle: createReactionEntityTitle({
      entityName: 'Observation',
      hasDelete: true,
      description: 'Observations are time-stamped comments, images, etc. that are recorded during the reaction',
    }),
    useInitialValues: buildUseInitialValues(value => value),
  },
  {
    pathComponents: ['setup'],
    entityName: ReactionNodeEntity.Setup,
    label: 'Setup',
    sidebarTitle: createReactionEntityTitle({
      entityName: 'Setup',
      hasDelete: false,
    }),
    useInitialValues: buildUseInitialValues(({ vessel, automationCode: _, ...rest }: ReactionSetup) => ({
      ...rest,
      vessel: withoutNestedArray(withoutNestedArray(vessel, 'vesselPreparations'), 'vesselAttachments'),
    })),
  },
  {
    pathComponents: ['vesselAttachments'],
    entityName: ReactionNodeEntity.VesselAttachments,
    label: 'Vessel Attachment',
    sidebarTitle: createReactionEntityTitle({
      entityName: 'Vessel Attachment',
      hasDelete: true,
    }),
    useInitialValues: buildUseInitialValues(value => value),
  },
  {
    pathComponents: ['vesselPreparations'],
    entityName: ReactionNodeEntity.VesselPreparations,
    label: 'Vessel Preparation',
    sidebarTitle: createReactionEntityTitle({
      entityName: 'Vessel Preparation',
      hasDelete: true,
    }),
    useInitialValues: buildUseInitialValues(value => value),
  },
  {
    pathComponents: ['automationCode', 'setup'],
    ...featureSidebarInfo,
    label: 'Automation Code',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Automation Code', hasDelete: true }),
  },
  {
    pathComponents: ['conditions'],
    entityName: ReactionNodeEntity.Conditions,
    label: 'Conditions',
    sidebarTitle: createReactionEntityTitle({
      entityName: 'Conditions',
      hasDelete: false,
    }),
    useInitialValues: buildUseInitialValues(
      ({ temperature, electrochemistry, pressure, ...rest }: ReactionConditions) => ({
        ...rest,
        temperature: withoutNestedArray(temperature, 'temperatureMeasurements'),
        electrochemistry: withoutNestedArray(electrochemistry, 'electrochemistryMeasurements'),
        pressure: withoutNestedArray(pressure, 'pressureMeasurements'),
      }),
    ),
  },
  {
    pathComponents: ['temperatureMeasurements'],
    entityName: ReactionNodeEntity.TemperatureMeasurements,
    label: 'Temperature Measurement',
    sidebarTitle: createReactionEntityTitle({
      entityName: 'Temperature Measurement',
      hasDelete: true,
    }),
    useInitialValues: buildUseInitialValues(values => values),
  },
  {
    pathComponents: ['electrochemistryMeasurements'],
    entityName: ReactionNodeEntity.ElectrochemistryMeasurements,
    label: 'Electrochemistry Measurement',
    sidebarTitle: createReactionEntityTitle({
      entityName: 'Electrochemistry Measurement',
      hasDelete: true,
    }),
    useInitialValues: buildUseInitialValues(values => values),
  },
  {
    pathComponents: ['pressureMeasurements'],
    entityName: ReactionNodeEntity.PressureMeasurements,
    label: 'Pressure Measurement',
    sidebarTitle: createReactionEntityTitle({
      entityName: 'Pressure Measurement',
      hasDelete: true,
    }),
    useInitialValues: buildUseInitialValues(values => values),
  },
  {
    pathComponents: ['workups'],
    entityName: ReactionNodeEntity.Workups,
    label: 'Workups',
    sidebarTitle: createReactionEntityTitle({
      entityName: 'Workups',
      description:
        'Workup steps refer to any additions, purifications, or other operations after the ‘reaction’ stage prior to analysis',
      hasDelete: true,
    }),
    useInitialValues: buildUseInitialValues(
      ({ input: _, temperature, ...rest }: ReactionWorkup): Partial<ReactionWorkup> => ({
        ...rest,
        temperature: temperature
          ? (withoutNestedArray(temperature, 'temperatureMeasurements') as ReactionTemperatureCondition)
          : temperature,
      }),
    ),
  },
  ...componentsSidebars,
];
