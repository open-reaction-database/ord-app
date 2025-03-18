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
import { NumberInput, type NumberInputProps } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import { useCallback } from 'react';

interface AppNumberInputProps extends Omit<NumberInputProps, 'value' | 'defaultValue' | 'onChange'> {
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
}

export function AppNumberInput({ value, defaultValue, onChange, ...rest }: Readonly<AppNumberInputProps>) {
  const [uncontrolledValue, uncontrolledOnChange] = useUncontrolled({
    value,
    defaultValue,
    onChange,
  });

  const handleChange = useCallback(
    (updatedValue: number | string) => {
      // Potentially dangerous but should be OK as long as onBlur always returns number.
      // Otherwise things like 0. cannot be inserted
      uncontrolledOnChange(updatedValue === '' ? null : (updatedValue as number));
    },
    [uncontrolledOnChange],
  );

  return (
    <NumberInput
      value={uncontrolledValue ?? ''}
      onChange={handleChange}
      {...rest}
    />
  );
}
