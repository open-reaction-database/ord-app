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
import type { ValuePrecisionUnit } from './valuePrecisionUnitControl.types';
import { Input } from '@mantine/core';
import { InputGroup } from '../InputGroup/InputGroup';
import type { SelectOptions } from 'common/types/selectOptions';
import { AppSegmentedControl } from '../AppSegmentedControl/AppSegmentedControl';
import classes from './valuePrecisionUnitControl.module.scss';
import { useUncontrolled } from '@mantine/hooks';
import { AppNativeSelect } from '../AppNativeSelect/AppNativeSelect';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { AppNumberInput } from 'common/components/inputs/AppNumberInput/AppNumberInput.tsx';
import type { Optional } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';

interface ValuePrecisionUnitControlProps {
  value?: ValuePrecisionUnit;
  defaultValue?: ValuePrecisionUnit;
  label?: ReactNode;
  onChange: (value: ValuePrecisionUnit) => void;
  options: SelectOptions;
  select?: 'native' | 'native-inline' | 'segmented';
  disabled?: boolean;
}

const useValuePrecisionUnitsUncontrolledValues = ({
  options,
  ...props
}: Pick<ValuePrecisionUnitControlProps, 'value' | 'defaultValue' | 'onChange' | 'options'>): [
  ValuePrecisionUnit,
  (value: ValuePrecisionUnit) => void,
] => {
  const [uncontrolledValue, uncontrolledOnChange] = useUncontrolled(props);

  return [
    {
      value: uncontrolledValue?.value ?? null,
      precision: uncontrolledValue?.precision ?? null,
      units: uncontrolledValue?.units ?? options[0],
    },
    uncontrolledOnChange,
  ];
};

export function ValuePrecisionUnitControl({
  options,
  label,
  select = 'segmented',
  disabled,
  ...rest
}: Readonly<ValuePrecisionUnitControlProps>) {
  const [uncontrolledValue, uncontrolledOnChange] = useValuePrecisionUnitsUncontrolledValues({ options, ...rest });

  const handleChange = (name: keyof ValuePrecisionUnit, newValue: string | number | null) => {
    const previousValue = uncontrolledValue ?? {};
    uncontrolledOnChange({ ...previousValue, [name]: newValue } as ValuePrecisionUnit);
  };

  const unitOnChange = handleChange.bind(null, 'units');

  return (
    <Input.Wrapper label={label}>
      <div className={clsx(classes.wrapper, { [classes.inline]: select === 'native-inline' })}>
        <InputGroup>
          <AppNumberInput
            value={uncontrolledValue.value}
            onChange={(value: Optional<number>) => handleChange('value', value)}
            placeholder="Value"
            disabled={disabled}
          />
          <AppNumberInput
            value={uncontrolledValue.precision}
            onChange={(value: Optional<number>) => handleChange('precision', value)}
            leftSection="±"
            placeholder="Precision"
            disabled={disabled}
          />
          {select === 'native-inline' && (
            <AppNativeSelect
              value={uncontrolledValue.units}
              options={options}
              onChange={unitOnChange}
              disabled={disabled}
            />
          )}
        </InputGroup>
        {select === 'native' && (
          <AppNativeSelect
            value={uncontrolledValue.units}
            options={options}
            onChange={unitOnChange}
            disabled={disabled}
          />
        )}
        {select === 'segmented' && (
          <AppSegmentedControl
            value={uncontrolledValue.units}
            options={options}
            onChange={unitOnChange}
            fullWidth
            disabled={disabled}
          />
        )}
      </div>
    </Input.Wrapper>
  );
}
