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
import axiosInstance from 'store/axiosInstance.ts';
import { fullReactionSnapshot } from 'test/fullReactionSnapshot.ts';
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { ComponentsLookup } from './ComponentsLookup.tsx';

vi.mock('store/axiosInstance.ts', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));

// axios methods are overloaded, so vi.mocked() doesn't surface the mock helpers under tsc.
const axiosMock = axiosInstance as unknown as Record<
  'get' | 'post' | 'patch' | 'delete',
  ReturnType<typeof vi.fn>
>;

// Smoke test: the component mounts inside the reaction view's providers without throwing.
const Component = ComponentsLookup as unknown as () => JSX.Element;

// A whole reaction, so the edit converts to a protobuf for its save.
const reaction = fullReactionSnapshot().data;
const inputId = Object.keys(reaction.inputs)[0];
const componentPath = ['inputs', inputId, 'components', 0];

function lookUp(name: string, onClose: () => void) {
  const view = renderInReactionView(<ComponentsLookup onClose={onClose} />, {
    reaction,
    pathComponents: componentPath,
  });
  fireEvent.change(view.getByLabelText('Compound name'), { target: { value: name } });
  fireEvent.click(view.getByRole('button', { name: 'Save' }));
  return view;
}

describe('ComponentsLookup', () => {
  it('mounts without crashing', () => {
    const { container } = renderInReactionView(<Component />);
    expect(container).toBeInTheDocument();
  });

  it('adds the resolved compound and closes', async () => {
    axiosMock.post.mockResolvedValue({ data: { smiles: 'O' } });
    // The save stays pending, so the store holds the edit as applied, before the server answers.
    axiosMock.patch.mockReturnValue(new Promise(() => undefined));
    const onClose = vi.fn();
    const { store } = lookUp('water', onClose);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const component =
      store.getState().entities.reactions.reactionsById[1].data.inputs[inputId]
        .components[0];
    expect(component.identifiers.at(-1)).toMatchObject({
      value: 'O',
      details: 'water',
    });
  });

  it('says so when the name does not resolve, and stays open', async () => {
    axiosMock.post.mockRejectedValue(new Error('not found'));
    const onClose = vi.fn();
    const { findByText } = lookUp('unobtainium', onClose);
    expect(await findByText('Compound not found')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
