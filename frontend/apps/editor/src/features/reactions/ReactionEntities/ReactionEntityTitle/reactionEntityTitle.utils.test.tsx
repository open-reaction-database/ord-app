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
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { createReactionEntityTitle } from './reactionEntityTitle.utils.tsx';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';

// Capture the props the factory forwards to the underlying title component.
vi.mock('./ReactionEntityTitle.tsx', () => ({
  ReactionEntityTitle: (
    props: Readonly<{
      entityName?: string;
      reactionId?: ReactionId;
      hasDelete?: boolean;
      pathComponents?: ReactionPathComponents;
    }>,
  ) => (
    <div data-testid="title">{`${props.entityName}:${props.reactionId}:${props.hasDelete}:${props.pathComponents?.join('.')}`}</div>
  ),
}));

describe('createReactionEntityTitle', () => {
  it('merges the fixed constructor props with the per-render props', () => {
    const Title = createReactionEntityTitle({ hasDelete: true, entityName: 'Input' });
    const { getByTestId } = renderWithMantine(
      <Title
        reactionId={5}
        pathComponents={['inputs', 0]}
      />,
    );
    // entityName + hasDelete come from the constructor; reactionId + pathComponents from the
    // render-time props — all forwarded to the underlying title.
    expect(getByTestId('title')).toHaveTextContent('Input:5:true:inputs.0');
  });
});
