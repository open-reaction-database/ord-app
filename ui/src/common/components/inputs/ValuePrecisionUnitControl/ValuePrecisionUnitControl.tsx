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
import { Input, NumberInput } from '@mantine/core';
import { InputGroup } from '../InputGroup/InputGroup';
import type { SelectOption } from 'common/types/selectOptions';
import { AppSegmentedControl } from '../AppSegmentedControl/AppSegmentedControl';
import classes from './valuePrecisionUnitControl.module.scss';
import { useUncontrolled } from '@mantine/hooks';
import { AppNativeSelect } from '../AppNativeSelect/AppNativeSelect';
import type { ReactNode } from 'react';

interface ValuePrecisionUnitControlProps {
  value?: ValuePrecisionUnit;
  defaultValue?: ValuePrecisionUnit;
  label?: ReactNode;
  onChange: (value: ValuePrecisionUnit) => void;
  options: Array<SelectOption<number | string>>;
  useNativeSelect?: boolean;
}

export function ValuePrecisionUnitControl({
  value,
  defaultValue,
  options,
  label,
  onChange,
  useNativeSelect = false,
}: Readonly<ValuePrecisionUnitControlProps>) {
  const [uncontrolledValue, uncontrolledOnChange] = useUncontrolled({
    value,
    defaultValue,
    onChange,
  });

  const handleChange = (name: keyof ValuePrecisionUnit, newValue: string | number) => {
    const previousValue = uncontrolledValue ?? {};
    uncontrolledOnChange({ ...previousValue, [name]: newValue });
  };

  const unitOnChange = handleChange.bind(null, 'units');

  return (
    <Input.Wrapper label={label}>
      <div className={classes.wrapper}>
        <InputGroup>
          <NumberInput
            value={uncontrolledValue?.value}
            onChange={(value: string | number) => handleChange('value', value)}
            placeholder="Value"
          />
          <NumberInput
            value={uncontrolledValue?.precision}
            onChange={(value: string | number) => handleChange('precision', value)}
            leftSection="±"
            placeholder="Precision"
          />
        </InputGroup>
        {useNativeSelect ? (
          <AppNativeSelect
            value={uncontrolledValue?.units}
            options={options}
            onChange={unitOnChange}
          />
        ) : (
          <AppSegmentedControl
            value={uncontrolledValue?.units}
            options={options}
            onChange={unitOnChange}
            fullWidth
          />
        )}
      </div>
    </Input.Wrapper>
  );
}
