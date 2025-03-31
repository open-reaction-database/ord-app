/*
 * Copyright 2024 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { ReactionFormCustomProps } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { useUncontrolled } from '@mantine/hooks';
import classes from './measurementValueControl.module.scss';
import { AppSegmentedControl } from 'common/components/inputs/AppSegmentedControl/AppSegmentedControl.tsx';
import {
  type ReactionMeasurementValue,
  type ReactionMeasurementValueMass,
  type ReactionMeasurementValueNumber,
  type ReactionMeasurementValueString,
  ReactionMeasurementValueType,
} from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { InputGroup } from 'common/components/inputs/InputGroup/InputGroup.tsx';
import { Input, TextInput } from '@mantine/core';
import { ValuePrecisionUnitControl } from 'common/components/inputs/ValuePrecisionUnitControl/ValuePrecisionUnitControl.tsx';
import { appAmountUnspecified, massUnitNames } from 'store/entities/reactions/reactionAmount/reactionAmount.models.ts';
import type { ValuePrecisionUnit } from 'common/components/inputs/ValuePrecisionUnitControl/valuePrecisionUnitControl.types.ts';
import type { ReactionAmount } from 'store/entities/reactions/reactionAmount/reactionAmount.types.ts';
import { useContext, type ChangeEvent } from 'react';
import { AppNumberInput } from 'common/components/inputs/AppNumberInput/AppNumberInput.tsx';
import { reactionContext } from 'features/reactions/reactions.context.ts';

const valueTypeOptions = Object.values(ReactionMeasurementValueType);

const massOptions = [appAmountUnspecified, ...massUnitNames];

interface ControlProps<T extends ReactionMeasurementValue> {
  value: T['value'];
  onChange: (value: T['value']) => void;
  disabled?: boolean;
}

function MeasurementValueControlNumber({
  value,
  onChange,
  disabled,
}: Readonly<ControlProps<ReactionMeasurementValueNumber>>) {
  const handleChange = (field: keyof typeof value, updatedValue: number | null) => {
    onChange({
      ...value,
      [field]: updatedValue,
    });
  };

  return (
    <InputGroup>
      <AppNumberInput
        onChange={handleChange.bind(null, 'value')}
        value={value.value}
        placeholder="Value"
        disabled={disabled}
      />
      <AppNumberInput
        onChange={handleChange.bind(null, 'precision')}
        value={value.precision}
        placeholder="Precision"
        leftSection="±"
        disabled={disabled}
      />
    </InputGroup>
  );
}

function MeasurementValueControlMass({
  value,
  onChange,
  disabled,
}: Readonly<ControlProps<ReactionMeasurementValueMass>>) {
  const handleChange = (value: ValuePrecisionUnit) => {
    onChange(value as ReactionAmount);
  };

  return (
    <ValuePrecisionUnitControl
      value={value}
      onChange={handleChange}
      options={massOptions}
      select="native-inline"
      disabled={disabled}
    />
  );
}

function MeasurementValueControlString({
  value,
  onChange,
  disabled,
}: Readonly<ControlProps<ReactionMeasurementValueString>>) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <TextInput
      value={value}
      onChange={handleChange}
      placeholder="Type"
      disabled={disabled}
    />
  );
}

const typeToComponent = {
  [ReactionMeasurementValueType.Number]: MeasurementValueControlNumber,
  [ReactionMeasurementValueType.Percent]: MeasurementValueControlNumber,
  [ReactionMeasurementValueType.Mass]: MeasurementValueControlMass,
  [ReactionMeasurementValueType.String]: MeasurementValueControlString,
};

const typeToDefaultValue = {
  [ReactionMeasurementValueType.Number]: { value: null, precision: null },
  [ReactionMeasurementValueType.Percent]: { value: null, precision: null },
  [ReactionMeasurementValueType.Mass]: { value: null, precision: null, units: appAmountUnspecified },
  [ReactionMeasurementValueType.String]: '',
};

const defaultValueType = ReactionMeasurementValueType.Percent;

const defaultMeasurementValue: ReactionMeasurementValueNumber = {
  type: defaultValueType,
  value: typeToDefaultValue[defaultValueType],
};

export function MeasurementValueControl({ name, formMethods }: Readonly<ReactionFormCustomProps>) {
  const { isViewOnly } = useContext(reactionContext);
  const [measurementValue, onChange] = useUncontrolled<ReactionMeasurementValue>({
    ...formMethods.getInputProps(name),
  });
  const { value, type } = measurementValue ?? defaultMeasurementValue;

  const Component = typeToComponent[type];

  const handleValueChange = (newValue: ReactionMeasurementValue['value']) => {
    onChange({ type: type, value: newValue } as ReactionMeasurementValue);
  };

  const handleTypeChange = (newType: string) => {
    const type = newType as ReactionMeasurementValueType;
    onChange({ type, value: typeToDefaultValue[type] } as ReactionMeasurementValue);
  };

  // Cannot produce correct type because of the map
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlValue = value as any;

  return (
    <Input.Wrapper label="Value">
      <div className={classes.wrapper}>
        <Component
          value={controlValue}
          onChange={handleValueChange}
          disabled={isViewOnly}
        />
        <AppSegmentedControl
          value={type}
          options={valueTypeOptions}
          onChange={handleTypeChange}
          disabled={isViewOnly}
        />
      </div>
    </Input.Wrapper>
  );
}
