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
import { describe, it, expect, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import type { FC } from 'react';
import {
  useDrawerStack,
  type ReactionViewDeleteButtonsProps,
} from '@open-reaction-database/ui/reaction';
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { ReactionSetVariablesButton } from './ReactionSetVariablesButton.tsx';
import { ReactionViewButton } from './ReactionViewButton.tsx';

function StackProbe() {
  return <output>{JSON.stringify(useDrawerStack())}</output>;
}

describe.each<[string, FC<ReactionViewDeleteButtonsProps>, string]>([
  ['ReactionViewButton', ReactionViewButton, 'View'],
  ['ReactionSetVariablesButton', ReactionSetVariablesButton, 'Set Variables'],
])('%s', (_name, Button, label) => {
  it('opens the entity without the click reaching the row around it', () => {
    const onRowClick = vi.fn();
    const { getByRole } = renderInReactionView(
      <>
        {/* Stands in for a row that toggles when clicked, like an accordion control. */}
        <div onClick={onRowClick}>
          <Button
            entityName="Notes"
            pathComponents={['notes']}
          />
        </div>
        <StackProbe />
      </>,
    );
    fireEvent.click(getByRole('button', { name: label }));
    expect(onRowClick).not.toHaveBeenCalled();
    expect(getByRole('status')).toHaveTextContent(JSON.stringify([['notes']]));
  });
});
