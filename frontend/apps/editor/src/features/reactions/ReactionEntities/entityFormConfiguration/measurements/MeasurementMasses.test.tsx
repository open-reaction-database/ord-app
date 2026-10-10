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
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { MeasurementMasses } from './MeasurementMasses.tsx';
import type { ReactionEntityNodeProps } from 'features/reactions/ReactionEntities/reactionEntityNode/reactionEntityNode.types.ts';

const formMethods = {
  getInputProps: () => ({ value: [10, 20], onChange: vi.fn() }),
} as unknown as ReactionEntityNodeProps['formMethods'];

const renderMasses = (isViewOnly = false) =>
  renderInReactionView(
    <MeasurementMasses
      name="masses"
      formMethods={formMethods}
    />,
    { isViewOnly },
  );

describe('MeasurementMasses', () => {
  it('renders the tags input with the current mass values and helper text', () => {
    const { getByText, getByPlaceholderText } = renderMasses();
    expect(getByPlaceholderText('Type to add unique')).toBeInTheDocument();
    expect(getByText('Only numbers are allowed.')).toBeInTheDocument();
    expect(getByText('10')).toBeInTheDocument();
    expect(getByText('20')).toBeInTheDocument();
  });

  it('disables the input in view-only mode', () => {
    const { getByPlaceholderText } = renderMasses(true);
    expect(getByPlaceholderText('Type to add unique')).toBeDisabled();
  });
});
