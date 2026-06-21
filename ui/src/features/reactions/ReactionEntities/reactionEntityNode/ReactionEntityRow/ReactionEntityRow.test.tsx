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
import { ReactionEntityRow } from './ReactionEntityRow.tsx';
import type { ReactionEntityNodeProps } from '../reactionEntityNode.types.ts';
import type { ReactionFormWrapper } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';

// Isolate the row from the recursive node registry (which pulls in the Ketcher/d3 editor).
vi.mock('../ReactionEntityBaseNode/ReactionEntityBaseNode.tsx', () => ({
  ReactionEntityBaseNode: ({ node }: Readonly<{ node: { type?: string } }>) => (
    <div data-testid="base-node">{node?.type ?? 'node'}</div>
  ),
}));

const formMethods = {} as ReactionEntityNodeProps<ReactionFormWrapper>['formMethods'];

describe('ReactionEntityRow', () => {
  it('renders the wrapper label and one base node per field', () => {
    const node = {
      grid: 2,
      fields: [{ type: 'a' }, { type: 'b' }],
      wrapperConfig: { label: 'Stirring' },
    } as unknown as ReactionFormWrapper;

    const { getByText, getAllByTestId } = renderWithMantine(
      <ReactionEntityRow
        node={node}
        formMethods={formMethods}
      />,
    );

    expect(getByText('Stirring')).toBeInTheDocument();
    expect(getAllByTestId('base-node')).toHaveLength(2);
  });

  it('lays the fields out in the configured number of grid columns', () => {
    const node = {
      grid: 3,
      fields: [{ type: 'a' }],
      wrapperConfig: { label: 'Grid' },
    } as unknown as ReactionFormWrapper;

    const { getByTestId } = renderWithMantine(
      <ReactionEntityRow
        node={node}
        formMethods={formMethods}
      />,
    );
    expect(getByTestId('base-node').parentElement).toHaveStyle({
      gridTemplateColumns: 'repeat(3, 1fr)',
    });
  });
});
