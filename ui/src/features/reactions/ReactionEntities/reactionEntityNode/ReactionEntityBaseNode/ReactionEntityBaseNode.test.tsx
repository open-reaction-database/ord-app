/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, it, expect } from 'vitest';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { ReactionEntityBaseNode } from './ReactionEntityBaseNode.tsx';
import { nodeToComponentContext } from '../reactionEntityNode.context.ts';
import { ReactionFormNodeType } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import type { ReactionNodeToComponent, ReactionEntityNodeProps } from '../reactionEntityNode.types.ts';

const Stub = () => <div data-testid="mapped">mapped</div>;
const nodeToComponent = { [ReactionFormNodeType.value]: Stub } as unknown as ReactionNodeToComponent;
const formMethods = {} as ReactionEntityNodeProps['formMethods'];

const renderNode = (type: ReactionFormNodeType) =>
  renderWithMantine(
    <nodeToComponentContext.Provider value={nodeToComponent}>
      <ReactionEntityBaseNode
        node={{ type } as ReactionEntityNodeProps['node']}
        formMethods={formMethods}
      />
    </nodeToComponentContext.Provider>,
  );

describe('ReactionEntityBaseNode', () => {
  it('renders the component mapped to the node type', () => {
    const { getByTestId } = renderNode(ReactionFormNodeType.value);
    expect(getByTestId('mapped')).toBeInTheDocument();
  });

  it('renders nothing for a node type with no mapped component', () => {
    const { queryByTestId } = renderNode(ReactionFormNodeType.block);
    expect(queryByTestId('mapped')).not.toBeInTheDocument();
  });
});
