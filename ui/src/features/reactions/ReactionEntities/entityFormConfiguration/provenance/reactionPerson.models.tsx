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
import { ReactionFormNodeType, type ReactionFormNode } from '../../reactionEntities.types.ts';
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid.ts';
import type { FC } from 'react';
import { UpdatePersonInfo, type UpdatePersonInfoProps } from './UpdatePersonInfo.tsx';

function createUpdatePersonInfo(text: string): FC<Omit<UpdatePersonInfoProps, 'text'>> {
  return function UpdatePersonInfoWithText(props) {
    return (
      <UpdatePersonInfo
        {...props}
        text={text}
      />
    );
  };
}

export const createUpdatePersonInfoRow = (fieldName: string, text: string): ReactionFormNode => ({
  type: ReactionFormNodeType.wrapper,
  grid: 4,
  fields: [
    {
      type: ReactionFormNodeType.custom,
      name: fieldName,
      Component: createUpdatePersonInfo(text),
    },
  ],
});

export const createReactionPerson = (fieldName: string): Array<ReactionFormNode> => [
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.value,
      name: `${fieldName}.name`,
      inputType: 'string',
      wrapperConfig: {
        label: 'Name',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: `${fieldName}.username`,
      inputType: 'string',
      wrapperConfig: {
        label: 'Username',
      },
    },
  ),
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.value,
      name: `${fieldName}.email`,
      inputType: 'string',
      wrapperConfig: {
        label: 'E-mail',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: `${fieldName}.orcid`,
      inputType: 'string',
      wrapperConfig: {
        label: 'ORCID ID',
      },
    },
    {
      type: ReactionFormNodeType.value,
      name: `${fieldName}.organization`,
      inputType: 'string',
      wrapperConfig: {
        label: 'Organization',
      },
    },
  ),
];
