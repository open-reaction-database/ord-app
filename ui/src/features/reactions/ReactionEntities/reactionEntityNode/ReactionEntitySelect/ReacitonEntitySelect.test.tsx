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
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { ReactionEntitySelect } from './ReacitonEntitySelect.tsx';
import type { ReactionEntityNodeProps } from '../reactionEntityNode.types.ts';
import type { ReactionFormSelect } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';

const formMethods = {
  getInputProps: () => ({ value: 'A', onChange: vi.fn() }),
} as unknown as ReactionEntityNodeProps<ReactionFormSelect>['formMethods'];

const renderSelect = (selectType: string, isViewOnly = false) =>
  renderInReactionView(
    <ReactionEntitySelect
      node={{ name: 'field', selectType, options: ['A', 'B'] } as unknown as ReactionFormSelect}
      formMethods={formMethods}
    />,
    { isViewOnly },
  );

describe('ReactionEntitySelect', () => {
  it('renders a native select with the options for the dropdown variant', () => {
    const { container } = renderSelect('dropdown');
    const select = container.querySelector('select');
    expect(select).not.toBeNull();
    expect(select?.querySelectorAll('option')).toHaveLength(2);
  });

  it('disables the dropdown in view-only mode', () => {
    const { container } = renderSelect('dropdown', true);
    expect(container.querySelector('select')).toBeDisabled();
  });

  it('renders a segmented control (radios) for the non-dropdown variant', () => {
    const { getByText, container } = renderSelect('segmented');
    expect(container.querySelector('select')).toBeNull();
    expect(getByText('A')).toBeInTheDocument();
    expect(getByText('B')).toBeInTheDocument();
  });

  it('disables the segmented control in view-only mode', () => {
    const { container } = renderSelect('segmented', true);
    const radios = container.querySelectorAll('input[type=radio]');
    expect(radios.length).toBeGreaterThan(0);
    radios.forEach(radio => expect(radio).toBeDisabled());
  });
});
