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
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderInReactionView, emptyReactionData } from 'test/renderInReactionView.tsx';
import { Provenance } from './Provenance.tsx';
import { AppDataType } from 'store/entities/reactions/reactionData/reactionData.types.ts';
import type { AppReaction } from 'store/entities/reactions/reactions.types.ts';

const Component = Provenance as unknown as () => JSX.Element;

describe('Provenance', () => {
  it('mounts within the reaction view without crashing', () => {
    const { container } = renderInReactionView(<Component />);
    expect(container).toBeInTheDocument();
  });

  it('renders reaction metadata entries from provenance.reactionMetadata', () => {
    const reaction = emptyReactionData();
    reaction.provenance.reactionMetadata = {
      'meta-1': {
        id: 'meta-1',
        name: 'project_id',
        description: 'internal id',
        data: { type: AppDataType.Text, value: 'ORD-123', format: null },
      },
    };
    renderInReactionView(<Component />, {
      reaction: reaction as AppReaction,
    });
    expect(screen.getByText('Reaction Metadata project_id')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('ORD-123')).toBeInTheDocument();
    expect(screen.getByText('internal id')).toBeInTheDocument();
  });
});
