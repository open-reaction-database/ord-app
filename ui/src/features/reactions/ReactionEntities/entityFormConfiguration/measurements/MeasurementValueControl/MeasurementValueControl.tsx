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
import { type ChangeEvent, useContext, useMemo } from 'react';
import { AppNumberInput } from 'common/components/inputs/AppNumberInput/AppNumberInput.tsx';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import { VariableType } from 'store/entities/templates/templates.types.ts';
import type { Optional } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';

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
      placeholder=""
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

function optionalStringNumberToNumber(value: Optional<number | string>): Optional<number> {
  if (!value) {
    return null;
  }
  if (typeof value === 'number') {
    return value;
  }
  const parsedValue = parseFloat(value);
  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function handleMeasurementTypeChange(
  previousValue: ReactionMeasurementValue,
  newType: ReactionMeasurementValueType,
): ReactionMeasurementValue {
  let precisionNumberValue: Optional<number>;
  let mainValue: Optional<number | string>;
  if (previousValue.type === ReactionMeasurementValueType.String) {
    mainValue = previousValue.value;
    precisionNumberValue = null;
  } else {
    mainValue = previousValue.value.value ?? null;
    precisionNumberValue = previousValue.value.precision ?? null;
  }

  if (newType === ReactionMeasurementValueType.String) {
    return { type: newType, value: mainValue ? mainValue.toString() : '' };
  }
  const mainNumberValue = optionalStringNumberToNumber(mainValue);
  const newValue = {
    ...typeToDefaultValue[newType],
    value: mainNumberValue,
    precision: precisionNumberValue,
  };

  return { type: newType, value: newValue } as ReactionMeasurementValue;
}

const defaultValueType = ReactionMeasurementValueType.Percent;

const defaultMeasurementValue: ReactionMeasurementValueNumber = {
  type: defaultValueType,
  value: typeToDefaultValue[defaultValueType],
};

export function MeasurementValueControl({ name, formMethods }: Readonly<ReactionFormCustomProps>) {
  const { isViewOnly, ValueLabelComponent } = useContext(reactionContext);
  const [measurementValue, onChange] = useUncontrolled<ReactionMeasurementValue>({
    ...formMethods.getInputProps(name),
  });
  const activeMeasurementValue = measurementValue ?? defaultMeasurementValue;
  const { value, type } = activeMeasurementValue;
  const Component = typeToComponent[type];

  const valueName = useMemo(() => {
    switch (type) {
      case ReactionMeasurementValueType.Mass:
      case ReactionMeasurementValueType.Percent:
      case ReactionMeasurementValueType.Number:
        return `${name}.value.value`;
      default:
        return `${name}.value`;
    }
  }, [name, type]);

  const valueType = useMemo(() => {
    switch (type) {
      case ReactionMeasurementValueType.Mass:
      case ReactionMeasurementValueType.Number:
      case ReactionMeasurementValueType.Percent:
        return VariableType.Number;
      case ReactionMeasurementValueType.String:
        return VariableType.String;
    }
  }, [type]);

  const handleValueChange = (newValue: ReactionMeasurementValue['value']) => {
    onChange({ type: type, value: newValue } as ReactionMeasurementValue);
  };

  const handleTypeChange = (newType: string) => {
    onChange(handleMeasurementTypeChange(activeMeasurementValue, newType as ReactionMeasurementValueType));
  };

  // Cannot produce correct type because of the map
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlValue = value as any;

  return (
    <Input.Wrapper
      label={
        <ValueLabelComponent
          name={valueName}
          type={valueType}
          wrapperConfig={{ label: 'Value' }}
        />
      }
    >
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
