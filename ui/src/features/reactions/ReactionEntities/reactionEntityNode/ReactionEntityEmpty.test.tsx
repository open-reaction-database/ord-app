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
import { describe, it, expect, vi } from 'vitest';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { ReactionEntityEmpty } from './ReactionEntityEmpty.tsx';
import type { ReactionEntityNodeProps } from './reactionEntityNode.types.ts';
import type { ReactionFormEmpty } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';

// The empty node is a thin pass-through that renders its child fields via the recursive registry;
// stub the base node so the test stays off the Ketcher/d3 path.
vi.mock(
  'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBaseNode/ReactionEntityBaseNode.tsx',
  () => ({
    ReactionEntityBaseNode: ({ node }: Readonly<{ node: { type?: string } }>) => (
      <div data-testid="base-node">{node?.type ?? 'node'}</div>
    ),
  }),
);

const formMethods = {} as ReactionEntityNodeProps<ReactionFormEmpty>['formMethods'];

describe('ReactionEntityEmpty', () => {
  it('renders one base node for each of its fields, with no wrapper of its own', () => {
    const node = {
      fields: [{ type: 'x' }, { type: 'y' }, { type: 'z' }],
    } as unknown as ReactionFormEmpty;
    const { getAllByTestId } = renderWithMantine(
      <ReactionEntityEmpty
        node={node}
        formMethods={formMethods}
      />,
    );
    expect(getAllByTestId('base-node')).toHaveLength(3);
  });

  it('renders nothing when there are no fields', () => {
    const node = { fields: [] } as unknown as ReactionFormEmpty;
    const { queryByTestId } = renderWithMantine(
      <ReactionEntityEmpty
        node={node}
        formMethods={formMethods}
      />,
    );
    expect(queryByTestId('base-node')).not.toBeInTheDocument();
  });
});
