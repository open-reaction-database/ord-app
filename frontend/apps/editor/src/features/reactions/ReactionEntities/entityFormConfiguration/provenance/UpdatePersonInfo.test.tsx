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
import { fireEvent } from '@testing-library/react';
import {
  renderWithReaction,
  stubReactionActions,
} from '@open-reaction-database/ui/testing';
import { UpdatePersonInfo } from './UpdatePersonInfo.tsx';
import type { ReactionEntityNodeProps } from 'features/reactions/ReactionEntities/reactionEntityNode/reactionEntityNode.types.ts';
import type { ReactionActions } from '@open-reaction-database/ui/reaction';

const setValues = vi.fn();
const formMethods = { setValues } as unknown as ReactionEntityNodeProps['formMethods'];

const renderButton = (isViewOnly = false, actions?: ReactionActions) =>
  renderWithReaction(
    <UpdatePersonInfo
      name="provenance.recordCreated.person"
      formMethods={formMethods}
      text="Use my info"
    />,
    { editable: !isViewOnly, actions },
  );

describe('UpdatePersonInfo', () => {
  it('renders the action button and merges the user info on click when editable', () => {
    const actions = stubReactionActions();
    actions.currentPerson.mockReturnValue({
      name: 'Me',
      email: 'me@example.com',
      orcid: '0000-0001',
    });
    const { getByRole } = renderButton(false, actions);
    const button = getByRole('button', { name: 'Use my info' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(setValues).toHaveBeenCalledTimes(1);
    // setValues receives an updater; applying it to an empty form should populate the person at the
    // node's path with the host's current person.
    const updater = setValues.mock.calls[0][0] as (prev: object) => unknown;
    const result = updater({}) as { provenance: { recordCreated: { person: object } } };
    expect(result.provenance.recordCreated.person).toEqual({
      name: 'Me',
      email: 'me@example.com',
      orcid: '0000-0001',
    });
  });

  it('renders nothing in view-only mode', () => {
    const { queryByRole } = renderButton(true);
    expect(queryByRole('button', { name: 'Use my info' })).not.toBeInTheDocument();
  });

  it('asks a host written as a class for the person', () => {
    class HostActions implements ReactionActions {
      private readonly person = { name: 'Host' };
      update = vi.fn();
      remove = vi.fn();
      addIdentifierByName = vi.fn();
      currentPerson() {
        return this.person;
      }
    }
    fireEvent.click(
      renderButton(false, new HostActions()).getByRole('button', {
        name: 'Use my info',
      }),
    );
    const updater = setValues.mock.calls[0][0] as (prev: object) => unknown;
    const result = updater({}) as { provenance: { recordCreated: { person: object } } };
    expect(result.provenance.recordCreated.person).toEqual({ name: 'Host' });
  });

  it('renders nothing for a host that cannot name the current person', () => {
    const { queryByRole } = renderButton(false, {
      update: vi.fn(),
      remove: vi.fn(),
      addIdentifierByName: vi.fn(),
    });
    expect(queryByRole('button', { name: 'Use my info' })).not.toBeInTheDocument();
  });
});
