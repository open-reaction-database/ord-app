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
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { ReactionEntityList } from './ReactionEntityList.tsx';
import type { ReactionEntityNodeProps } from '../reactionEntityNode.types.ts';
import type { ReactionFormList } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';

const formMethods = {} as ReactionEntityNodeProps<ReactionFormList>['formMethods'];

const makeNode = () =>
  ({
    name: 'items',
    title: { label: 'Items' },
    getKey: (_item: unknown, index: number) => index,
    useSelectItems: () => [],
    ItemDisplay: () => null,
    addItem: { label: 'Add', useCreate: () => () => {} },
  }) as unknown as ReactionFormList;

describe('ReactionEntityList', () => {
  it('renders the list title and the add button when editable', () => {
    const { getByText } = renderInReactionView(
      <ReactionEntityList
        node={makeNode()}
        formMethods={formMethods}
      />,
    );
    expect(getByText('Items')).toBeInTheDocument();
    expect(getByText('Add')).toBeInTheDocument();
  });

  it('hides the add button in view-only mode', () => {
    const { queryByText } = renderInReactionView(
      <ReactionEntityList
        node={makeNode()}
        formMethods={formMethods}
      />,
      {
        isViewOnly: true,
      },
    );
    expect(queryByText('Add')).not.toBeInTheDocument();
  });
});
