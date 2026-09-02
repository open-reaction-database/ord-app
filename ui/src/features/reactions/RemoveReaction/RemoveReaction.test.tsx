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
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { RemoveReaction } from './RemoveReaction.tsx';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('RemoveReaction', () => {
  it('confirms that reactions move to trash', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RemoveReaction reactionId={1} />);

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(screen.getByText('Move reaction to trash')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to move this reaction to trash?'),
    ).toBeInTheDocument();
  });

  it('keeps permanent removal copy for templates', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RemoveReaction reactionId="template-1" />);

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(screen.getByText('Remove this template')).toBeInTheDocument();
  });
});
