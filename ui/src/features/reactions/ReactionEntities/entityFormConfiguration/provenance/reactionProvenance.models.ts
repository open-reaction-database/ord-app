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
} from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { buildUseSelectItems } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { ord } from 'ord-schema-protobufjs';
import { createEntityListItemComponent } from 'features/reactions/ReactionEntities/entityFormConfiguration/EntityListItem/entityListItem.utils.tsx';
import { buildUseCreate } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import { formatDate } from 'common/utils';
import { ordRecordEventToReaction } from 'store/entities/reactions/reactionProvenance/reactionProvenance.converters.ts';
import type { ReactionRecordEvent } from 'store/entities/reactions/reactionProvenance/reactionProvenance.types.ts';
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid.ts';
import { createReactionPerson, createUpdatePersonInfoRow } from './reactionPerson.models.tsx';

const createEmptyModification = (newIndex: number): [number, ReactionRecordEvent] => {
  return [newIndex, ordRecordEventToReaction(ord.RecordEvent.toObject(new ord.RecordEvent()))];
};

export const reactionProvenance: Array<ReactionFormNode> = [
  createUpdatePersonInfoRow('experimenter', 'I am experimenter'),
  ...createReactionPerson('experimenter'),
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.date,
      name: 'experiment.start',
      wrapperConfig: {
        label: 'Experiment start',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: 'city',
      inputType: 'string',
      wrapperConfig: {
        label: 'City',
      },
    },
  ),
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.value,
      name: 'experimenter.doi',
      inputType: 'string',
      wrapperConfig: {
        label: 'DOI',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: 'experiment.patent',
      inputType: 'string',
      wrapperConfig: {
        label: 'Patent',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: 'experiment.url',
      inputType: 'string',
      wrapperConfig: {
        label: 'Publication URL',
      },
    },
  ),
  {
    type: ReactionFormNodeType.block,
    title: {
      label: 'Record Creation',
    },
    fields: [
      createUpdatePersonInfoRow('recordCreated.person', 'I am contributor'),
      {
        type: ReactionFormNodeType.wrapper,
        grid: 2,
        fields: [
          {
            type: ReactionFormNodeType.dateTime,
            name: 'recordCreated.time.value',
            wrapperConfig: {
              label: 'Time',
            },
          },
        ],
      },
      ...createReactionPerson('recordCreated.person'),
      {
        type: ReactionFormNodeType.value,
        name: 'details',
        inputType: 'textarea',
        wrapperConfig: {
          label: 'Details',
        },
      },
    ],
  },
  {
    type: ReactionFormNodeType.list,
    title: {
      label: 'Record Modification',
    },
    getKey: (_, id) => id,
    useSelectItems: buildUseSelectItems('recordModified'),
    ItemDisplay: createEntityListItemComponent<ord.IRecordEvent>({
      entityField: 'recordModified',
      title: 'Record Modification',
      requiredFields: [
        {
          label: 'Time',
          render: item => formatDate(item.time?.value as string),
        },
        {
          label: 'Person e-mail',
          render: item => item.person?.email,
        },
      ],
    }),
    addItem: {
      label: 'Record Modification',
      useCreate: buildUseCreate('recordModified', createEmptyModification),
    },
  },
];
