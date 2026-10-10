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
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { InputsComponentsList } from './InputsComponentsList.tsx';
import type { ReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';

const inputs = [
  { id: 'in1', name: 'Input 1', components: [] },
] as unknown as Array<ReactionInput>;

describe('InputsComponentsList', () => {
  it('renders the column headers and one accordion item per input', () => {
    const { getByText } = renderInReactionView(
      <InputsComponentsList inputs={inputs} />,
    );
    for (const header of ['Input', 'Identifiers', 'Preview', 'Role', 'Amount']) {
      expect(getByText(header)).toBeInTheDocument();
    }
    expect(getByText('Input 1')).toBeInTheDocument();
    // An input with no components shows the empty state.
    expect(getByText('There are no Components yet')).toBeInTheDocument();
  });
});
