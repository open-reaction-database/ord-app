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
import { fireEvent, waitFor } from '@testing-library/react';
import {
  renderWithReaction,
  stubReactionActions,
} from '@open-reaction-database/ui/testing';
import type { ReactionActions } from '@open-reaction-database/ui/reaction';
import { ComponentsLookup } from './ComponentsLookup.tsx';

vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));

// Smoke test: the component mounts inside the reaction view's providers without throwing.
const Component = ComponentsLookup as unknown as () => JSX.Element;

const componentPath = ['inputs', 'in1', 'components', 0];

function lookUp(name: string, onClose: () => void, actions: ReactionActions) {
  const view = renderWithReaction(<ComponentsLookup onClose={onClose} />, {
    pathComponents: componentPath,
    actions,
  });
  fireEvent.change(view.getByLabelText('Compound name'), { target: { value: name } });
  fireEvent.click(view.getByRole('button', { name: 'Save' }));
  return view;
}

describe('ComponentsLookup', () => {
  it('mounts without crashing', () => {
    const { container } = renderWithReaction(<Component />, { editable: true });
    expect(container).toBeInTheDocument();
  });

  it('adds the resolved compound and closes', async () => {
    const actions = stubReactionActions();
    actions.addIdentifierByName.mockResolvedValue(true);
    const onClose = vi.fn();
    lookUp('water', onClose, actions);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(actions.addIdentifierByName).toHaveBeenCalledWith(
      [...componentPath, 'identifiers'],
      'water',
    );
  });

  it('says so when the name does not resolve, and stays open', async () => {
    const onClose = vi.fn();
    const { findByText } = lookUp('unobtainium', onClose, stubReactionActions());
    expect(await findByText('Compound not found')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('stops loading and says so when the lookup itself fails', async () => {
    const onClose = vi.fn();
    const { findByText, getByRole } = lookUp('water', onClose, {
      update: vi.fn(),
      remove: vi.fn(),
      addIdentifierByName: vi.fn().mockRejectedValue(new Error('offline')),
    });
    expect(await findByText('Compound not found')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Save' })).not.toHaveAttribute('data-loading');
    expect(onClose).not.toHaveBeenCalled();
  });
});
