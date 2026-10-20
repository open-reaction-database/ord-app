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
import { fireEvent } from '@testing-library/react';
import { renderWithReaction } from '#testing/renderWithReaction.tsx';
import { ReactionEntityDateTime } from './ReactionEntityDateTime.tsx';
import type { ReactionEntityNodeProps } from '#reaction/view/ReactionEntities/reactionEntityNode/reactionEntityNode.types.ts';
import type { ReactionFormDateTime } from '#reaction/view/ReactionEntities/reactionEntities.types.ts';

const onChange = vi.fn();
const formMethods = {
  getInputProps: () => ({ value: null, onChange }),
} as unknown as ReactionEntityNodeProps<ReactionFormDateTime>['formMethods'];

const renderDateTime = (isViewOnly = false) =>
  renderWithReaction(
    <ReactionEntityDateTime
      node={{ name: 'when', wrapperConfig: {} } as unknown as ReactionFormDateTime}
      formMethods={formMethods}
    />,
    { editable: !isViewOnly },
  );

describe('ReactionEntityDateTime', () => {
  it('renders the datetime picker with a "Now" shortcut when editable', () => {
    const { getByText, container } = renderDateTime();
    // Mantine's DateTimePicker renders a button + hidden input rather than a placeholdered input.
    expect(container.querySelector('input')).not.toBeNull();
    expect(getByText('Now')).toBeInTheDocument();
  });

  it('sets "Now" as the current time with the user\'s offset', () => {
    const { getByText } = renderDateTime();
    const before = Date.now();
    fireEvent.click(getByText('Now'));
    const value = onChange.mock.lastCall?.[0] as string;
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    // Seconds precision, so the instant is within a second of the click.
    expect(Math.abs(Date.parse(value) - before)).toBeLessThan(2000);
  });

  it('hides the "Now" shortcut in view-only mode', () => {
    const { queryByText } = renderDateTime(true);
    expect(queryByText('Now')).not.toBeInTheDocument();
  });
});
