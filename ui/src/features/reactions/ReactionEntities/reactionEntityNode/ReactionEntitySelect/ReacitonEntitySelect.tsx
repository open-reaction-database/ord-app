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
import { AppNativeSelect } from 'common/components/inputs/AppNativeSelect/AppNativeSelect.tsx';
import { AppSegmentedControl } from 'common/components/inputs/AppSegmentedControl/AppSegmentedControl.tsx';
import type { ReactionEntityNodeProps } from '../reactionEntityNode.types.ts';
import type { ReactionFormSelect } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { useReactionEntityLabel } from 'features/reactions/ReactionEntities/reactionEntityNode/useReactionEntityLabel.tsx';
import { useContext } from 'react';
import { reactionContext } from 'features/reactions/reactions.context.ts';

export function ReactionEntitySelect({ node, formMethods }: Readonly<ReactionEntityNodeProps<ReactionFormSelect>>) {
  const { isViewOnly } = useContext(reactionContext);
  const label = useReactionEntityLabel(node.wrapperConfig);
  const { getInputProps } = formMethods;

  return node.selectType === 'dropdown' ? (
    <AppNativeSelect
      name={node.name}
      options={node.options}
      label={label}
      {...getInputProps(node.name)}
      disabled={isViewOnly}
    />
  ) : (
    <AppSegmentedControl
      name={node.name}
      options={node.options}
      label={label}
      fullWidth
      {...getInputProps(node.name)}
      disabled={isViewOnly}
    />
  );
}
