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
import { describe, expect, it } from 'vitest';
import { renderWithReaction } from '#testing/renderWithReaction.tsx';
import { ReactionDrawerForm } from './ReactionDrawerForm.tsx';

describe('ReactionDrawerForm', () => {
  it('renders the entity’s form outside the drawer', () => {
    const { getByRole, queryByRole } = renderWithReaction(
      <ReactionDrawerForm pathComponents={['notes']} />,
      { editable: true },
    );
    expect(getByRole('button', { name: 'Save and Close' })).toBeInTheDocument();
    expect(queryByRole('heading', { name: 'Notes' })).not.toBeInTheDocument();
  });

  it('shows the entity’s title above the form when asked', () => {
    const { getByRole } = renderWithReaction(
      <ReactionDrawerForm
        pathComponents={['notes']}
        showTitle
      />,
      { editable: true },
    );
    expect(getByRole('heading', { name: 'Notes' })).toBeInTheDocument();
  });
});
