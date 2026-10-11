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
import { fireEvent } from '@testing-library/react';
import {
  useDrawerStack,
  type ReactionViewDeleteButtonsProps,
} from '@open-reaction-database/ui/reaction';
import { fullReactionSnapshot } from '@open-reaction-database/ui/testing';
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import type { ReactionFormCustomProps } from '../../reactionEntities.types.ts';
import { WorkupInput } from './WorkupInput.tsx';

// Smoke test: the component mounts inside the reaction view's providers without throwing.
const Component = WorkupInput as unknown as () => JSX.Element;

function StackProbe() {
  return <output>{JSON.stringify(useDrawerStack())}</output>;
}

/** Shows an Edit button for each row that can be edited. */
function EditButtons({ onEdit }: Readonly<ReactionViewDeleteButtonsProps>) {
  return onEdit ? (
    <button
      type="button"
      onClick={onEdit}
    >
      Edit
    </button>
  ) : null;
}

describe('WorkupInput', () => {
  it('mounts without crashing', () => {
    const { container } = renderInReactionView(<Component />);
    expect(container).toBeInTheDocument();
  });

  it('opens the workup input, then the component, when a component is edited', () => {
    const { getByRole } = renderInReactionView(
      <>
        <WorkupInput {...({ name: 'input' } as ReactionFormCustomProps)} />
        <StackProbe />
      </>,
      {
        reaction: fullReactionSnapshot().data,
        pathComponents: ['workups', 0],
        slots: { ViewDeleteButtons: EditButtons },
      },
    );
    fireEvent.click(getByRole('button', { name: 'Edit' }));
    expect(getByRole('status')).toHaveTextContent(
      JSON.stringify([
        ['workups', 0, 'input'],
        ['workups', 0, 'input', 'components', 0],
      ]),
    );
  });
});
