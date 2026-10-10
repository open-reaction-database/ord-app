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
import { ReactionEntityDate } from './ReactionEntityDate.tsx';
import type { ReactionEntityNodeProps } from '../reactionEntityNode.types.ts';
import type { ReactionFormDate } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';

const formMethods = {
  getInputProps: () => ({ value: null, onChange: vi.fn() }),
} as unknown as ReactionEntityNodeProps<ReactionFormDate>['formMethods'];

const renderDate = (isViewOnly = false) =>
  renderInReactionView(
    <ReactionEntityDate
      node={{ name: 'date', wrapperConfig: {} } as unknown as ReactionFormDate}
      formMethods={formMethods}
    />,
    { isViewOnly },
  );

describe('ReactionEntityDate', () => {
  it('renders a date input for a valid/empty value', () => {
    const { getByPlaceholderText } = renderDate();
    expect(getByPlaceholderText('Date')).toBeInTheDocument();
  });

  it('disables the date input in view-only mode', () => {
    const { getByPlaceholderText } = renderDate(true);
    expect(getByPlaceholderText('Date')).toBeDisabled();
  });
});
