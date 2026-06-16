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
import { renderInReactionView, emptyReactionData } from 'test/renderInReactionView.tsx';
import { ReactionInputPreview } from './ReactionInputPreview.tsx';
import type { AppReaction } from 'store/entities/reactions/reactions.types.ts';

vi.mock('common/components/ReactionPreview/ReactionComponentPreview.tsx', () => ({
  ReactionComponentPreview: () => <div data-testid="component-preview" />,
}));

describe('ReactionInputPreview', () => {
  it('renders the input name badge and a placeholder preview when it has no components', () => {
    const reaction = {
      ...emptyReactionData(),
      inputs: { in1: { id: 'in1', name: 'My Input', components: [] } },
    } as unknown as AppReaction;
    const { getByText, getByTestId } = renderInReactionView(
      <ReactionInputPreview
        reactionId={1}
        inputId="in1"
      />,
      {
        reactionId: 1,
        reaction,
      },
    );
    expect(getByText('My Input')).toBeInTheDocument();
    expect(getByTestId('component-preview')).toBeInTheDocument();
  });
});
