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
  environmentTypeOptions,
  vesselMaterialTypeOptions,
  vesselTypeOptions,
  volumeTypeOptions,
} from '#reaction/model/reactionEntityTypes/reactionEntityTypes.models.ts';
import {
  type ReactionVesselAttachment,
  type ReactionVesselPreparation,
} from '#reaction/model/reactionSetup/reactionSetup.types.ts';
import {
  ordVesselPreparationToReaction,
  ordVesselAttachmentToReaction,
} from '#reaction/model/reactionSetup/reactionSetup.converter.ts';
import { type ReactionPathComponents } from '#reaction/model/reactionPathComponents.ts';
import { type AppData } from '#reaction/model/reactionData/reactionData.types.ts';
import { ReactionBoolean } from '#reaction/model/reactionEntity/reactionEntity.types.ts';
import {
  ReactionFormNodeType,
  type ReactionFormNode,
} from '#reaction/view/ReactionEntities/reactionEntities.types.ts';
import { wrapInputsWithGrid } from '#display/utils/reactionForm/wrapInputsWithGrid.ts';
import { booleanOptions } from '#reaction/view/ReactionEntities/entityFormConfiguration/booleanOptions.ts';
import {
  buildUseSelectItems,
  buildUseSelectItemsListFromMap,
} from '#reaction/view/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { createEntityListItemComponent } from '#reaction/view/ReactionEntities/entityFormConfiguration/EntityListItem/entityListItem.utils.tsx';
import { buildUseCreate } from '#reaction/view/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import { create } from '@bufbuild/protobuf';
import {
  VesselAttachmentSchema,
  VesselPreparationSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { compareNamedEntities } from '#reaction/view/ReactionEntities/entityFormConfiguration/compareNamedEntities.ts';
import {
  createReactionDataAddItem,
  reactionDataDisplay,
} from '#reaction/view/ReactionEntities/entityFormConfiguration/data/reactionData.models.tsx';

export const vesselPreparationEntityPath: ReactionPathComponents = [
  'vessel',
  'vesselPreparations',
];
export const vesselAttachmentEntityPath: ReactionPathComponents = [
  'vessel',
  'vesselAttachments',
];

export const automationCodeEntityPath = 'automationCode';

export const reactionSetup: Array<ReactionFormNode> = [
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.select,
      name: 'vessel.type',
      selectType: 'dropdown',
      options: vesselTypeOptions,
      wrapperConfig: {
        label: 'Vessel',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: 'vessel.details',
      inputType: 'string',
      wrapperConfig: {
        label: 'Details',
      },
    },
  ),
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.select,
      name: 'vessel.material.type',
      selectType: 'dropdown',
      options: vesselMaterialTypeOptions,
      wrapperConfig: {
        label: 'Material',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: 'vessel.material.details',
      inputType: 'string',
      wrapperConfig: {
        label: 'Details',
      },
    },
  ),
  {
    type: ReactionFormNodeType.vpu,
    name: 'vessel.volume',
    options: volumeTypeOptions,
    wrapperConfig: {
      label: 'Volume',
    },
    select: 'native',
  },
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.select,
      name: 'isAutomated',
      selectType: 'segmented',
      options: booleanOptions,
      wrapperConfig: {
        label: 'Automated',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: 'automationPlatform',
      inputType: 'string',
      condition: {
        name: 'isAutomated',
        isHidden: isAutomated => isAutomated !== ReactionBoolean.True,
      },
      wrapperConfig: {
        label: 'Platform',
      },
    },
  ),
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.select,
      name: 'environment.type',
      selectType: 'dropdown',
      options: environmentTypeOptions,
      wrapperConfig: {
        label: 'Environment',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: 'environment.details',
      inputType: 'string',
      wrapperConfig: {
        label: 'Details',
      },
    },
  ),
  {
    type: ReactionFormNodeType.list,
    name: automationCodeEntityPath,
    getKey: item => (item as AppData).id,
    title: {
      label: 'Automation code',
      hint: 'Details of the exact automation procedure required to perform the reaction',
    },
    useSelectItems: buildUseSelectItemsListFromMap(
      automationCodeEntityPath,
      compareNamedEntities,
    ),
    ItemDisplay: reactionDataDisplay(automationCodeEntityPath),
    addItem: createReactionDataAddItem(automationCodeEntityPath, 'Automation code'),
  },
  {
    type: ReactionFormNodeType.list,
    name: vesselPreparationEntityPath.join('.'),
    getKey: (_, index) => index,
    title: {
      label: 'Vessel Preparation',
    },
    useSelectItems: buildUseSelectItems(vesselPreparationEntityPath),
    ItemDisplay: createEntityListItemComponent<ReactionVesselPreparation>({
      entityField: vesselPreparationEntityPath,
      title: 'Vessel Preparation',
      requiredFields: [
        {
          label: 'Type',
          render: item => item.type,
        },
        {
          label: 'Details',
          render: item => item.details ?? '',
        },
      ],
    }),
    addItem: {
      label: 'Vessel Preparation',
      useCreate: buildUseCreate(vesselPreparationEntityPath, index => {
        return [index, ordVesselPreparationToReaction(create(VesselPreparationSchema))];
      }),
    },
  },
  {
    type: ReactionFormNodeType.list,
    name: vesselAttachmentEntityPath.join('.'),
    getKey: (_, index) => index,
    title: {
      label: 'Vessel Attachment',
    },
    useSelectItems: buildUseSelectItems(vesselAttachmentEntityPath),
    ItemDisplay: createEntityListItemComponent<ReactionVesselAttachment>({
      entityField: vesselAttachmentEntityPath,
      title: 'Vessel Attachment',
      requiredFields: [
        {
          label: 'Type',
          render: item => item.type,
        },
        {
          label: 'Details',
          render: item => item.details ?? '',
        },
      ],
    }),
    addItem: {
      label: 'Vessel Attachment',
      useCreate: buildUseCreate(vesselAttachmentEntityPath, index => {
        return [index, ordVesselAttachmentToReaction(create(VesselAttachmentSchema))];
      }),
    },
  },
];
