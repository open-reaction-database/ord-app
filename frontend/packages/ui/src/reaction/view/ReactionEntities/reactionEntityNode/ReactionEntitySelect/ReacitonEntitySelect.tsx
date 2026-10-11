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
import { AppNativeSelect } from '#display/inputs/AppNativeSelect/AppNativeSelect.tsx';
import { AppSegmentedControl } from '#display/inputs/AppSegmentedControl/AppSegmentedControl.tsx';
import type { ReactionEntityNodeProps } from '#reaction/view/ReactionEntities/reactionEntityNode/reactionEntityNode.types.ts';
import type { ReactionFormSelect } from '#reaction/view/ReactionEntities/reactionEntities.types.ts';
import { useIsViewOnly } from '#reaction/provider/reactionProvider.hooks.ts';
import { VariableType } from '#reaction/model/variableType.ts';
import { ReactionValueLabelWrapper } from '#reaction/view/ReactionValueLabelWrapper.tsx';

export function ReactionEntitySelect({
  node,
  formMethods,
}: Readonly<ReactionEntityNodeProps<ReactionFormSelect>>) {
  const isViewOnly = useIsViewOnly();
  const label = (
    <ReactionValueLabelWrapper
      name={node.name}
      wrapperConfig={node.wrapperConfig}
      type={VariableType.Select}
    />
  );
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
