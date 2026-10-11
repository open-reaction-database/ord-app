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
import { renderWithReaction } from '#testing/renderWithReaction.tsx';
import { emptyReactionData } from '#testing/emptyReactionData.ts';
import { ReactionPreview } from './ReactionPreview.tsx';
import type { AppReaction } from '#reaction/model/reactions.types.ts';

vi.mock('./ReactionComponentPreview.tsx', () => ({
  ReactionComponentPreview: () => <div data-testid="component-preview" />,
}));

describe('ReactionPreview', () => {
  it('shows the empty placeholder when the reaction has no inputs or outcomes', () => {
    const { getByText } = renderWithReaction(<ReactionPreview />, {
      editable: true,
      reaction: emptyReactionData(),
    });
    expect(getByText('There are no Inputs and Outcomes yet')).toBeInTheDocument();
  });

  it('renders an input card when the reaction has inputs', () => {
    const data = {
      ...emptyReactionData(),
      inputs: { in1: { id: 'in1', name: 'Input A', components: [] } },
    } as unknown as AppReaction;
    const { getByText } = renderWithReaction(<ReactionPreview />, {
      editable: true,
      reaction: data,
    });
    expect(getByText('Input A')).toBeInTheDocument();
  });

  it('shows the conditions over the arrow only when asked for details', () => {
    const options = {
      reaction: {
        ...emptyReactionData(),
        inputs: { in1: { id: 'in1', name: 'Input A', components: [] } },
      } as unknown as AppReaction,
      record: {
        summary: { provenance: {}, summary: {}, conditions: 'Stirred at 25 C' },
      },
    };
    const plain = renderWithReaction(<ReactionPreview />, options);
    expect(plain.queryByText('Stirred at 25 C')).not.toBeInTheDocument();
    plain.unmount();
    const detailed = renderWithReaction(<ReactionPreview showDetails />, options);
    expect(detailed.getByText('Stirred at 25 C')).toBeInTheDocument();
  });
});
