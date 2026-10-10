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
import { ReactionEntityCustom } from './ReactionEntityCustom.tsx';
import type { ReactionEntityNodeProps } from '../reactionEntityNode.types.ts';
import type { ReactionFormCustom } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';

const Custom = ({ name }: Readonly<{ name: string }>) => (
  <div data-testid="custom">{name}</div>
);
const formMethods = {} as ReactionEntityNodeProps<ReactionFormCustom>['formMethods'];

describe('ReactionEntityCustom', () => {
  it('renders the node-supplied Component with the node name', () => {
    const node = {
      name: 'my-field',
      Component: Custom,
    } as unknown as ReactionFormCustom;
    const { getByTestId } = renderWithMantine(
      <ReactionEntityCustom
        node={node}
        formMethods={formMethods}
      />,
    );
    expect(getByTestId('custom')).toHaveTextContent('my-field');
  });
});
