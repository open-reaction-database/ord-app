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
import { ReactionEntity } from 'features/reactions/ReactionEntities/entityFormConfiguration/reactionEntityToForm.models.ts';
import { createReactionEntityTitle } from 'features/reactions/ReactionEntities/ReactionEntityTitle/ReactionEntityTitle.tsx';
import type { ReactionSidebarInfo } from './sidebarInfo.types.ts';
import { buildUseInitialValues } from 'features/reactions/ReactionEntities/sidebarInfo/buildUseInitialValues.ts';
import type { ord } from 'ord-schema-protobufjs';
import type {
  AppReactionCompound,
  AppReactionInput,
} from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import type {
  AppReactionAnalysis,
  AppReactionOutcome,
} from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.types.ts';

export const reactionSidebarInfo: Array<ReactionSidebarInfo> = [
  {
    pathComponents: ['notes'],
    entityName: ReactionEntity.Notes,
    label: 'Notes',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Notes', hasDelete: false }),
    useInitialValues: buildUseInitialValues((values: ord.IReactionNotes) => values),
  },
  {
    pathComponents: ['inputs'],
    entityName: ReactionEntity.Inputs,
    label: 'Input',
    sidebarTitle: createReactionEntityTitle({
      entityName: 'Input',
      hasDelete: true,
      description: 'Reaction inputs include every chemical added to the reaction vessel',
    }),
    useInitialValues: buildUseInitialValues(({ components: _, ...rest }: AppReactionInput) => rest),
  },
  {
    pathComponents: ['components', 'inputs'],
    entityName: ReactionEntity.Components,
    label: 'Component',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Component', hasDelete: false }),
    useInitialValues: buildUseInitialValues(
      ({ identifiers: _i, molBlockIdentifiers: _m, ...rest }: AppReactionCompound) => rest,
    ),
  },
  {
    pathComponents: ['identifiers'],
    entityName: ReactionEntity.Identifiers,
    label: 'Identifier',
    sidebarTitle: createReactionEntityTitle({
      entityName: 'Identifier',
      hasDelete: false,
      description: 'Reaction identifiers define descriptions of the overall reaction',
    }),
    useInitialValues: buildUseInitialValues(value => value),
  },
  {
    pathComponents: ['preparations', 'components', 'inputs'],
    entityName: ReactionEntity.ComponentPreparations,
    label: 'Preparation',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Preparation', hasDelete: true }),
    useInitialValues: buildUseInitialValues(value => value),
  },
  {
    pathComponents: ['features', 'components', 'inputs'],
    entityName: ReactionEntity.Data,
    label: 'Features',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Features', hasDelete: true }),
    useInitialValues: buildUseInitialValues(value => value),
  },
  {
    pathComponents: ['identifiers', 'components', 'inputs'],
    entityName: ReactionEntity.ComponentIdentifiers,
    label: 'Identifiers',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Identifier', hasDelete: true }),
    useInitialValues: buildUseInitialValues(value => value),
  },
  {
    pathComponents: ['outcomes'],
    entityName: ReactionEntity.Outcomes,
    label: 'Outcomes',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Outcome', hasDelete: true }),
    useInitialValues: buildUseInitialValues(({ analyses: _a, products: _p, ...rest }: AppReactionOutcome) => rest),
  },
  {
    pathComponents: ['analyses', 'outcomes'],
    entityName: ReactionEntity.Analyses,
    label: 'Analyses',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Analysis', hasDelete: true }),
    useInitialValues: buildUseInitialValues(({ data: _, ...rest }: AppReactionAnalysis) => rest),
  },
  {
    pathComponents: ['data', 'analyses', 'outcomes'],
    entityName: ReactionEntity.Data,
    label: 'Analytical Data',
    sidebarTitle: createReactionEntityTitle({ entityName: 'Analytical Data', hasDelete: true }),
    useInitialValues: buildUseInitialValues(value => value),
  },
];

const dataEntityNames = ['features', 'data'];

export const allowedEntityNames: Array<string> = [...Object.values(ReactionEntity), ...dataEntityNames];
