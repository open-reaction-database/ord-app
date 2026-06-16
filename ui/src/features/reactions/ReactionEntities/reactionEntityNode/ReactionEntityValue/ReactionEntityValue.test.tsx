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
import { ReactionEntityValue } from './ReactionEntityValue.tsx';
import type { ReactionEntityNodeProps } from '../reactionEntityNode.types.ts';
import type { ReactionFormValue } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';

const formMethods = {
  getInputProps: () => ({ value: '', onChange: vi.fn() }),
} as unknown as ReactionEntityNodeProps<ReactionFormValue>['formMethods'];

const renderValue = (inputType: string, isViewOnly = false) =>
  renderInReactionView(
    <ReactionEntityValue
      node={{ name: 'field', inputType } as unknown as ReactionFormValue}
      formMethods={formMethods}
    />,
    { isViewOnly },
  );

describe('ReactionEntityValue', () => {
  it('renders a text input for string fields', () => {
    const { container } = renderValue('string');
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
    expect(input).not.toBeDisabled();
  });

  it('renders a textarea for textarea fields', () => {
    const { container } = renderValue('textarea');
    expect(container.querySelector('textarea')).not.toBeNull();
  });

  it('renders a numeric input for number fields', () => {
    const { container } = renderValue('number');
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('disables the input in view-only mode', () => {
    const { container } = renderValue('string', true);
    expect(container.querySelector('input')).toBeDisabled();
  });

  it('renders nothing for an unknown input type', () => {
    const { container } = renderValue('mystery');
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('textarea')).toBeNull();
  });
});
