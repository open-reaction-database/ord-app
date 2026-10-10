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
import { renderInReactionView, emptyReactionData } from 'test/renderInReactionView.tsx';
import { MeasurementsBasedOn } from './MeasurementsBasedOn.tsx';
import type { AppReaction } from 'store/entities/reactions/reactions.types.ts';
import type { ReactionEntityNodeProps } from 'features/reactions/ReactionEntities/reactionEntityNode/reactionEntityNode.types.ts';

const formMethods = {
  getInputProps: () => ({ value: null, onChange: vi.fn() }),
} as unknown as ReactionEntityNodeProps['formMethods'];

const reaction = {
  ...emptyReactionData(),
  outcomes: [{ id: 'o1', products: [], analyses: { a1: { id: 'a1', name: 'NMR' } } }],
} as unknown as AppReaction;

const renderBasedOn = (isViewOnly = false) =>
  renderInReactionView(
    <MeasurementsBasedOn
      name="basedOn"
      formMethods={formMethods}
    />,
    {
      reactionId: 1,
      reaction,
      pathComponents: ['outcomes', 0, 'measurements', 0],
      isViewOnly,
    },
  );

describe('MeasurementsBasedOn', () => {
  it('renders the analysis select', () => {
    const { getByPlaceholderText } = renderBasedOn();
    expect(getByPlaceholderText('Select analysis')).toBeInTheDocument();
  });

  it('disables the select in view-only mode', () => {
    const { getByPlaceholderText } = renderBasedOn(true);
    expect(getByPlaceholderText('Select analysis')).toBeDisabled();
  });
});
