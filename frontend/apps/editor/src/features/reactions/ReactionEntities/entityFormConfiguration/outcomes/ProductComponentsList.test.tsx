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
import { renderInReactionView, emptyReactionData } from 'test/renderInReactionView.tsx';
import { ProductsComponentsList } from './ProductComponentsList.tsx';
import type { AppReaction } from 'store/entities/reactions/reactions.types.ts';

const reaction = {
  ...emptyReactionData(),
  outcomes: [{ id: 'o1', products: [], analyses: {} }],
} as unknown as AppReaction;

const renderList = (isViewOnly = false) =>
  renderInReactionView(<ProductsComponentsList />, {
    reactionId: 1,
    reaction,
    pathComponents: ['outcomes', 0],
    isViewOnly,
  });

describe('ProductsComponentsList', () => {
  it('renders the Products title and the add-Product button when editable', () => {
    const { getByText } = renderList();
    expect(getByText('Products')).toBeInTheDocument();
    expect(getByText('Product')).toBeInTheDocument();
  });

  it('hides the add-Product button in view-only mode', () => {
    const { queryByText } = renderList(true);
    expect(queryByText('Product')).not.toBeInTheDocument();
  });
});
