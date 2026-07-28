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
import { MeasurementValueControl } from './MeasurementValueControl.tsx';
import { ReactionMeasurementValueType } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import type { ReactionEntityNodeProps } from 'features/reactions/ReactionEntities/reactionEntityNode/reactionEntityNode.types.ts';

// formMethods with a configurable measurement `type` (sibling field) and optional existing value.
const makeFormMethods = (
  measurementType?: string,
  value?: unknown,
): ReactionEntityNodeProps['formMethods'] =>
  ({
    getInputProps: () => ({ value, onChange: vi.fn() }),
    getValues: () => ({ type: measurementType }),
  }) as unknown as ReactionEntityNodeProps['formMethods'];

const numericValue = {
  type: ReactionMeasurementValueType.Number,
  value: { value: null, precision: null },
};

const renderControl = (
  formMethods: ReactionEntityNodeProps['formMethods'],
  isViewOnly = false,
) =>
  renderInReactionView(
    <MeasurementValueControl
      name="value"
      formMethods={formMethods}
    />,
    { isViewOnly },
  );

describe('MeasurementValueControl', () => {
  it('renders the value and precision inputs for a numeric measurement', () => {
    const { getByPlaceholderText } = renderControl(
      makeFormMethods('CUSTOM', numericValue),
    );
    expect(getByPlaceholderText('Value')).toBeInTheDocument();
    expect(getByPlaceholderText('Precision')).toBeInTheDocument();
  });

  it('disables the inputs in view-only mode', () => {
    const { getByPlaceholderText } = renderControl(
      makeFormMethods('CUSTOM', numericValue),
      true,
    );
    expect(getByPlaceholderText('Value')).toBeDisabled();
    expect(getByPlaceholderText('Precision')).toBeDisabled();
  });

  // #604: with no value set yet, the value-type is preselected from the measurement's own type.
  it.each([
    { measurementType: 'SELECTIVITY', expected: ReactionMeasurementValueType.Number },
    { measurementType: 'YIELD', expected: ReactionMeasurementValueType.Percent },
    { measurementType: 'PURITY', expected: ReactionMeasurementValueType.Percent },
    { measurementType: 'AMOUNT', expected: ReactionMeasurementValueType.Mass },
    { measurementType: 'AREA', expected: ReactionMeasurementValueType.Number },
  ])(
    'defaults an unset $measurementType value to the $expected value-type (#604)',
    ({ measurementType, expected }) => {
      const { container } = renderControl(makeFormMethods(measurementType, undefined));
      // happy-dom's :checked selector doesn't match property-set state, so read the property.
      const checked = Array.from(
        container.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
      ).find(radio => radio.checked);
      expect(checked?.value).toBe(expected);
    },
  );
});
