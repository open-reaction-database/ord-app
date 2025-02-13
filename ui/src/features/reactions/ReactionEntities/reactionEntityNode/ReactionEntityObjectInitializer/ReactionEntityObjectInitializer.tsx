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
import type { ReactionEntityNodeProps } from 'features/reactions/ReactionEntities/reactionEntityNode/reactionEntityNode.types.ts';
import type { ReactionFormObjectInitializer } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { ReactionEntityBaseNode } from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBaseNode/ReactionEntityBaseNode.tsx';
import { useEffect, useRef } from 'react';

export function ReactionEntityObjectInitializer({
  node,
  formMethods,
}: Readonly<ReactionEntityNodeProps<ReactionFormObjectInitializer>>) {
  const formMethodsRef = useRef(formMethods);

  useEffect(() => {
    const { getInputProps, resetDirty } = formMethodsRef.current;
    const inputProps = getInputProps(node.name);
    if (!inputProps.value && !inputProps.defaultValue) {
      inputProps.onChange({});
      // Beware, resetDirty do not work with nested fields
      resetDirty({ [node.name]: {} });
    }
  }, [node.name, formMethodsRef]);

  return (
    <ReactionEntityBaseNode
      node={node.field}
      formMethods={formMethods}
    />
  );
}
