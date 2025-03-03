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
import { NativeSelect, type NativeSelectProps } from '@mantine/core';
import type { SelectOptions } from 'common/types/selectOptions';
import { useUncontrolled } from '@mantine/hooks';
import { useCallback, type ChangeEvent } from 'react';

interface AppNativeSelectProps extends Omit<NativeSelectProps, 'onChange' | 'data' | 'value' | 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  options: SelectOptions;
  onChange: (value: string) => void;
}

export function AppNativeSelect({ value, defaultValue, onChange, options, ...rest }: Readonly<AppNativeSelectProps>) {
  const [controlledValue, controlledOnChange] = useUncontrolled({
    value,
    defaultValue,
    onChange,
  });

  const handleChange = useCallback(
    (value: ChangeEvent<HTMLSelectElement>) => {
      controlledOnChange(value.target.value);
    },
    [controlledOnChange],
  );

  return (
    <NativeSelect
      value={controlledValue}
      onChange={handleChange}
      data={options}
      {...rest}
    />
  );
}
