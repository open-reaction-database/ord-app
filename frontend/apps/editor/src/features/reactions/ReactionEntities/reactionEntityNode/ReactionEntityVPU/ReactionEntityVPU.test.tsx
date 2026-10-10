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
import { ReactionEntityVPU } from './ReactionEntityVPU.tsx';
import type { ReactionEntityNodeProps } from '../reactionEntityNode.types.ts';
import type { ReactionFormValuePrecisionUnit } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';

const formMethods = {
  getInputProps: () => ({ value: undefined, onChange: vi.fn() }),
} as unknown as ReactionEntityNodeProps<ReactionFormValuePrecisionUnit>['formMethods'];

const renderVPU = (isViewOnly = false) =>
  renderInReactionView(
    <ReactionEntityVPU
      node={
        {
          name: 'amount',
          options: ['mL', 'L'],
        } as unknown as ReactionFormValuePrecisionUnit
      }
      formMethods={formMethods}
    />,
    { isViewOnly },
  );

describe('ReactionEntityVPU', () => {
  it('renders the value and precision inputs', () => {
    const { getByPlaceholderText } = renderVPU();
    expect(getByPlaceholderText('Value')).toBeInTheDocument();
    expect(getByPlaceholderText('Precision')).toBeInTheDocument();
  });

  it('disables the inputs in view-only mode', () => {
    const { getByPlaceholderText } = renderVPU(true);
    expect(getByPlaceholderText('Value')).toBeDisabled();
    expect(getByPlaceholderText('Precision')).toBeDisabled();
  });
});
