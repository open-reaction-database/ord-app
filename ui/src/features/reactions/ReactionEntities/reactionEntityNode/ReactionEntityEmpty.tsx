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
import type { ReactionFormEmpty } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { ReactionEntityBaseNode } from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBaseNode/ReactionEntityBaseNode.tsx';

export function ReactionEntityEmpty({ node, formMethods }: Readonly<ReactionEntityNodeProps<ReactionFormEmpty>>) {
  return node.fields.map((node, index) => (
    <ReactionEntityBaseNode
      key={`${node.type}-${index}`}
      node={node}
      formMethods={formMethods}
    />
  ));
}
