/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { AppReaction } from '#reaction/model/reactions.types.ts';
import { emptyReactionData } from '#testing/emptyReactionData.ts';
import { renderWithReaction } from '#testing/renderWithReaction.tsx';
import { ReactionHeader } from './ReactionHeader.tsx';

describe('ReactionHeader', () => {
  it('shows the reaction ID, the actions it is given, and the preview', () => {
    const { getByRole, getByText } = renderWithReaction(
      <ReactionHeader
        actions={<button type="button">Page action</button>}
        titleActions={<button type="button">Title action</button>}
      />,
      {
        editable: true,
        record: { pb_reaction_id: 'ord-123', is_valid: true, validation: null },
      },
    );
    expect(getByRole('heading', { name: 'ord-123' })).toBeInTheDocument();
    expect(getByText('Page action')).toBeInTheDocument();
    expect(getByText('Title action')).toBeInTheDocument();
    expect(getByText('Copy reaction image')).toBeInTheDocument();
    expect(getByText('There are no Inputs and Outcomes yet')).toBeInTheDocument();
  });

  it('passes the request for details to its preview', () => {
    const { getByText } = renderWithReaction(<ReactionHeader showDetails />, {
      editable: true,
      reaction: {
        ...emptyReactionData(),
        inputs: { in1: { id: 'in1', name: 'Input A', components: [] } },
      } as unknown as AppReaction,
      record: {
        pb_reaction_id: 'ord-123',
        summary: { provenance: {}, summary: {}, conditions: 'Stirred at 25 C' },
      },
    });
    expect(getByText('Stirred at 25 C')).toBeInTheDocument();
  });
});
