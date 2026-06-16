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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { UpdatePersonInfo } from './UpdatePersonInfo.tsx';
import type { ReactionEntityNodeProps } from 'features/reactions/ReactionEntities/reactionEntityNode/reactionEntityNode.types.ts';

// selectSelf is a (state) => user selector; return a populated user so the click handler has data.
vi.mock('store/entities/users/users.selectors.ts', () => ({
  selectSelf: () => ({ name: 'Me', email: 'me@example.com', orcid_id: '0000-0001' }),
}));

const setValues = vi.fn();
const formMethods = { setValues } as unknown as ReactionEntityNodeProps['formMethods'];

const renderButton = (isViewOnly = false) =>
  renderInReactionView(
    <UpdatePersonInfo
      name="provenance.recordCreated.person"
      formMethods={formMethods}
      text="Use my info"
    />,
    { isViewOnly },
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UpdatePersonInfo', () => {
  it('renders the action button and merges the user info on click when editable', () => {
    const { getByRole } = renderButton();
    const button = getByRole('button', { name: 'Use my info' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(setValues).toHaveBeenCalledTimes(1);
    // setValues receives an updater; applying it to an empty form should populate the person at the
    // node's path from the mocked user (name/email, and orcid_id mapped to the proto `orcid` key).
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
});
