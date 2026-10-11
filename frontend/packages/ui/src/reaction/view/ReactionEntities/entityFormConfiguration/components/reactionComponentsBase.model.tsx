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
  type ReactionFormNode,
  ReactionFormNodeType,
} from '#reaction/view/ReactionEntities/reactionEntities.types.ts';
import {
  buildUseSelectItems,
  buildUseSelectItemsListFromMap,
} from '#reaction/view/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { createEntityListItemComponent } from '#reaction/view/ReactionEntities/entityFormConfiguration/EntityListItem/entityListItem.utils.tsx';
import { buildUseCreate } from '#reaction/view/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import { create } from '@bufbuild/protobuf';
import { CompoundIdentifierSchema } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { CustomIdentifiers } from '#reaction/view/ReactionEntities/entityFormConfiguration/components/CustomIdentifiers/CustomIdentifiers.tsx';
import { type AppData } from '#reaction/model/reactionData/reactionData.types.ts';
import { type ReactionCompoundIdentifier } from '#reaction/model/reactionEntity/reactionEntity.types.ts';
import { ordCompoundIdentifierToReaction } from '#reaction/model/reactionEntity/reactionEntity.converters.ts';
import { textureTypeOptions } from '#reaction/model/reactionEntityTypes/reactionEntityTypes.models.ts';
import { compareNamedEntities } from '#reaction/view/ReactionEntities/entityFormConfiguration/compareNamedEntities.ts';
import {
  createReactionDataAddItem,
  reactionDataDisplay,
} from '#reaction/view/ReactionEntities/entityFormConfiguration/data/reactionData.models.tsx';
import { wrapInputsWithGrid } from '#display/utils/reactionForm/wrapInputsWithGrid.ts';
import { ComponentPreview } from '#reaction/view/ReactionEntities/entityFormConfiguration/components/ComponentPreview/ComponentPreview.tsx';

export const componentPreview: ReactionFormNode = {
  type: ReactionFormNodeType.custom,
  name: '',
  Component: ComponentPreview,
};

export const molBlockIdentifiers: ReactionFormNode = {
  type: ReactionFormNodeType.custom,
  name: 'customIdentifiers',
  Component: CustomIdentifiers,
};

export const identifiersList: ReactionFormNode = {
  type: ReactionFormNodeType.list,
  name: 'identifiers',
  title: {
    label: 'Identifiers',
  },
  getKey: (_, index) => index,
  useSelectItems: buildUseSelectItems('identifiers'),
  ItemDisplay: createEntityListItemComponent<ReactionCompoundIdentifier>({
    entityField: 'identifiers',
    title: 'Identifier',
    requiredFields: [
      {
        label: 'Type',
        render: item => item.type,
      },
      {
        label: 'Value',
        render: item => item.value,
      },
    ],
    optionalFields: [
      {
        label: 'Details',
        render: item => item.details,
      },
    ],
  }),
  addItem: {
    label: 'Identifier',
    useCreate: buildUseCreate('identifiers', index => {
      const emptyItem = ordCompoundIdentifierToReaction(
        create(CompoundIdentifierSchema),
      );
      return [index, emptyItem];
    }),
  },
};

export const featuresList: ReactionFormNode = {
  type: ReactionFormNodeType.list,
  name: 'features',
  title: {
    label: 'Features',
    hint: 'Additional chemical features (e.g., calculated descriptors) that are important to associate with this compound.',
  },
  getKey: (item: AppData) => item.id,
  useSelectItems: buildUseSelectItemsListFromMap('features', compareNamedEntities),
  ItemDisplay: reactionDataDisplay('features'),
  addItem: createReactionDataAddItem('features', 'Feature'),
};

export const textureDetails: ReactionFormNode = {
  type: ReactionFormNodeType.block,
  name: 'texture',
  title: {
    label: 'Isolated Material Characteristics',
  },
  fields: [
    wrapInputsWithGrid(
      {
        type: ReactionFormNodeType.select,
        name: 'texture.type',
        selectType: 'dropdown',
        options: textureTypeOptions,
        wrapperConfig: {
          label: 'Texture',
        },
      },
      {
        type: ReactionFormNodeType.value,
        name: 'texture.details',
        inputType: 'string',
        wrapperConfig: {
          label: 'Texture details',
        },
      },
    ),
  ],
};
