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
import { NumberInput, Textarea, TextInput } from '@mantine/core';
import type { ReactionEntityNodeProps } from '../reactionEntityNode.types.ts';
import type { ReactionFormValue } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { useContext } from 'react';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import { VariableType } from 'store/entities/templates/templates.types.ts';

const getVariableType = (inputType: ReactionFormValue['inputType']): VariableType => {
  switch (inputType) {
    case 'number':
      return VariableType.Number;
    case 'string':
    case 'textarea':
      return VariableType.String;
  }
};

export function ReactionEntityValue({
  node,
  formMethods: { getInputProps },
}: Readonly<ReactionEntityNodeProps<ReactionFormValue>>) {
  const { isViewOnly, ValueLabelComponent } = useContext(reactionContext);
  const type = getVariableType(node.inputType);

  const label = (
    <ValueLabelComponent
      name={node.name}
      type={type}
      wrapperConfig={node.wrapperConfig}
    />
  );

  const inputProps = { placeholder: 'Type', ...(node.inputConfig ?? {}) };
  const props = { name: node.name, label, ...inputProps };

  switch (node.inputType) {
    case 'textarea':
      return (
        <Textarea
          {...props}
          {...getInputProps(node.name)}
          disabled={isViewOnly}
        />
      );
    case 'number':
      return (
        <NumberInput
          {...props}
          {...getInputProps(node.name)}
          disabled={isViewOnly}
        />
      );
    case 'string':
      return (
        <TextInput
          {...props}
          {...getInputProps(node.name)}
          disabled={isViewOnly}
        />
      );
    default:
      return null;
  }
}
