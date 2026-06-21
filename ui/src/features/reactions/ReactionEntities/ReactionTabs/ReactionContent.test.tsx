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
import { ReactionContent } from './ReactionContent.tsx';

// In "tabs" mode the content is the tabbed editor, which pulls in the Ketcher/d3 node registry;
// stub it so this test exercises ReactionContent's own view-mode branching.
vi.mock('./ReactionTabs', () => ({
  ReactionTabs: () => <div data-testid="reaction-tabs" />,
}));

describe('ReactionContent', () => {
  it('renders the tabbed editor in "tabs" mode', () => {
    const { getByTestId, queryByText } = renderInReactionView(
      <ReactionContent
        reactionId={1}
        viewMode="tabs"
      />,
      {
        reactionId: 1,
      },
    );
    expect(getByTestId('reaction-tabs')).toBeInTheDocument();
    // The flat section list is not rendered in tabs mode.
    expect(queryByText('Conditions')).not.toBeInTheDocument();
  });

  it('renders the flat section list in "list" mode', () => {
    const { getByText, queryByTestId } = renderInReactionView(
      <ReactionContent
        reactionId={1}
        viewMode="list"
      />,
      {
        reactionId: 1,
      },
    );
    expect(queryByTestId('reaction-tabs')).not.toBeInTheDocument();
    // A few of the stacked view sections render their titles.
    expect(getByText('Conditions')).toBeInTheDocument();
    expect(getByText('Setup')).toBeInTheDocument();
    expect(getByText('Identifiers')).toBeInTheDocument();
  });
});
