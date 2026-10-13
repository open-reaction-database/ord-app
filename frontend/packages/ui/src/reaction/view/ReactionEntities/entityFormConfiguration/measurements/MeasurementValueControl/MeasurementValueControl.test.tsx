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
import { renderWithReaction } from '#testing/renderWithReaction.tsx';
import { MeasurementValueControl } from './MeasurementValueControl.tsx';
import { ReactionMeasurementValueType } from '#reaction/model/reactionComponent/reactionComponent.types.ts';
import type { ReactionEntityNodeProps } from '#reaction/view/ReactionEntities/reactionEntityNode/reactionEntityNode.types.ts';

const formMethods = {
  getInputProps: () => ({
    value: {
      type: ReactionMeasurementValueType.Number,
      value: { value: null, precision: null },
    },
    onChange: vi.fn(),
  }),
} as unknown as ReactionEntityNodeProps['formMethods'];

const renderControl = (isViewOnly = false) =>
  renderWithReaction(
    <MeasurementValueControl
      name="measurement"
      formMethods={formMethods}
    />,
    { editable: !isViewOnly },
  );

describe('MeasurementValueControl', () => {
  it('renders the value and precision inputs for a numeric measurement', () => {
    const { getByPlaceholderText } = renderControl();
    expect(getByPlaceholderText('Value')).toBeInTheDocument();
    expect(getByPlaceholderText('Precision')).toBeInTheDocument();
  });

  it('disables the inputs in view-only mode', () => {
    const { getByPlaceholderText } = renderControl(true);
    expect(getByPlaceholderText('Value')).toBeDisabled();
    expect(getByPlaceholderText('Precision')).toBeDisabled();
  });
});
