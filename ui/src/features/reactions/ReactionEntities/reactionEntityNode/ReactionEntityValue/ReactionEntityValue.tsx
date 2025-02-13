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
import { useReactionEntityLabel } from 'features/reactions/ReactionEntities/reactionEntityNode/useReactionEntityLabel.tsx';

export function ReactionEntityValue({
  node,
  formMethods: { getInputProps },
}: Readonly<ReactionEntityNodeProps<ReactionFormValue>>) {
  const label = useReactionEntityLabel(node.wrapperConfig);

  const inputProps = { placeholder: 'Type', ...(node.inputConfig ?? {}) };
  const props = { name: node.name, label, ...inputProps };

  switch (node.inputType) {
    case 'textarea':
      return (
        <Textarea
          {...props}
          {...getInputProps(node.name)}
        />
      );
    case 'number':
      return (
        <NumberInput
          {...props}
          {...getInputProps(node.name)}
        />
      );
    case 'string':
      return (
        <TextInput
          {...props}
          {...getInputProps(node.name)}
        />
      );
    default:
      return null;
  }
}
