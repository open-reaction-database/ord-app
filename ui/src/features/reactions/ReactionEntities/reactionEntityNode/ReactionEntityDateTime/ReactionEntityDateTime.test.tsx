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
import { ReactionEntityDateTime } from './ReactionEntityDateTime.tsx';
import type { ReactionEntityNodeProps } from '../reactionEntityNode.types.ts';
import type { ReactionFormDateTime } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';

const formMethods = {
  getInputProps: () => ({ value: null, onChange: vi.fn() }),
} as unknown as ReactionEntityNodeProps<ReactionFormDateTime>['formMethods'];

const renderDateTime = (isViewOnly = false) =>
  renderInReactionView(
    <ReactionEntityDateTime
      node={{ name: 'when', wrapperConfig: {} } as unknown as ReactionFormDateTime}
      formMethods={formMethods}
    />,
    { isViewOnly },
  );

describe('ReactionEntityDateTime', () => {
  it('renders the datetime picker with a "Now" shortcut when editable', () => {
    const { getByText, container } = renderDateTime();
    // Mantine's DateTimePicker renders a button + hidden input rather than a placeholdered input.
    expect(container.querySelector('input')).not.toBeNull();
    expect(getByText('Now')).toBeInTheDocument();
  });

  it('hides the "Now" shortcut in view-only mode', () => {
    const { queryByText } = renderDateTime(true);
    expect(queryByText('Now')).not.toBeInTheDocument();
  });
});
