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
import type { AppReaction } from 'store/entities/reactions/reactions.types.ts';
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { emptyReactionData } from 'test/emptyReactionData.ts';
import { CustomIdentifiers } from './CustomIdentifiers.tsx';

// Ketcher needs a canvas to load; its editor stays closed here.
vi.mock('./ComponentsKetcherEditor/ComponentsKetcherEditor.tsx', () => ({
  ComponentsKetcherEditor: () => null,
}));

const reaction = {
  ...emptyReactionData(),
  inputs: {
    in1: { id: 'in1', name: 'in1', components: [{ id: 'c1', identifiers: [] }] },
  },
} as unknown as AppReaction;

describe('CustomIdentifiers', () => {
  it('opens the name lookup from Add Identifier and closes it on Cancel', async () => {
    const { getByText, getByRole, queryByLabelText, findByLabelText } =
      renderInReactionView(<CustomIdentifiers />, {
        reaction,
        pathComponents: ['inputs', 'in1', 'components', 0],
      });
    expect(queryByLabelText('Compound name')).not.toBeInTheDocument();
    fireEvent.click(getByText('Add Identifier'));
    expect(await findByLabelText('Compound name')).toBeInTheDocument();
    fireEvent.click(getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(queryByLabelText('Compound name')).not.toBeInTheDocument(),
    );
  });
});
