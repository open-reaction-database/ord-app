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
import { renderWithReaction } from '#testing/renderWithReaction.tsx';
import { ReactionEntityTitle } from './ReactionEntityTitle.tsx';

// Smoke test: mounts within seeded reaction/entity contexts + store without throwing.
const Component = ReactionEntityTitle as unknown as () => JSX.Element;

describe('ReactionEntityTitle', () => {
  it('mounts without crashing', () => {
    const { container } = renderWithReaction(<Component />, { editable: true });
    expect(container).toBeInTheDocument();
  });

  const title = (options: Parameters<typeof renderWithReaction>[1]) =>
    renderWithReaction(
      <ReactionEntityTitle
        pathComponents={['notes']}
        entityName="Notes"
        hasDelete
      />,
      options,
    );

  it('offers Delete when the reaction can be edited', () => {
    expect(
      title({ editable: true }).getByRole('button', { name: 'Remove Notes' }),
    ).toBeInTheDocument();
  });

  it.each([
    ['a read-only dataset', {}],
    ['a template', { reactionId: 'template_1', isTemplate: true }],
  ] as const)('offers no Delete on %s', (_name, options) => {
    expect(
      title(options).queryByRole('button', { name: 'Remove Notes' }),
    ).not.toBeInTheDocument();
  });
});
