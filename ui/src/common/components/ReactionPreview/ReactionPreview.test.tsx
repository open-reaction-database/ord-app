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
import { ReactionPreview } from './ReactionPreview.tsx';
import type {
  AppReaction,
  ReactionOrTemplate,
} from 'store/entities/reactions/reactions.types.ts';

vi.mock('common/components/ReactionPreview/ReactionComponentPreview.tsx', () => ({
  ReactionComponentPreview: () => <div data-testid="component-preview" />,
}));

describe('ReactionPreview', () => {
  it('shows the empty placeholder when the reaction has no inputs or outcomes', () => {
    const data = emptyReactionData();
    const reaction = {
      id: 1,
      data,
      summary: { conditions: '' },
    } as unknown as ReactionOrTemplate;
    const { getByText } = renderInReactionView(
      <ReactionPreview reaction={reaction} />,
      {
        reactionId: 1,
        reaction: data,
      },
    );
    expect(getByText('There are no Inputs and Outcomes yet')).toBeInTheDocument();
  });

  it('renders an input card when the reaction has inputs', () => {
    const data = {
      ...emptyReactionData(),
      inputs: { in1: { id: 'in1', name: 'Input A', components: [] } },
    } as unknown as AppReaction;
    const reaction = {
      id: 1,
      data,
      summary: { conditions: '' },
    } as unknown as ReactionOrTemplate;
    const { getByText } = renderInReactionView(
      <ReactionPreview reaction={reaction} />,
      {
        reactionId: 1,
        reaction: data,
      },
    );
    expect(getByText('Input A')).toBeInTheDocument();
  });
});
