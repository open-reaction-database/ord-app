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
import { createReactionEntityTitle } from 'features/reactions/ReactionEntities/ReactionEntityTitle/ReactionEntityTitle.tsx';
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

type SidebarInfoPathLess = Omit<ReactionSidebarInfo, 'pathComponents'>;

const componentSidebarInfo: Omit<SidebarInfoPathLess, 'label' | 'sidebarTitle'> = {
  entityName: ReactionNodeEntity.Components,
  useInitialValues: buildUseInitialValues(
    ({ identifiers: _i, molBlockIdentifiers: _m, features: _f, preparations: _p, ...rest }: ReactionInputComponent) =>
      rest,
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
    label: 'Input',
    sidebarTitle: createReactionEntityTitle({
      entityName: 'Input',
      hasDelete: true,
      description: 'Reaction inputs include every chemical added to the reaction vessel',
    }),
    useInitialValues: buildUseInitialValues(({ components: _, ...rest }: ReactionInput) => rest),
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
  ...componentsSidebars,
];
