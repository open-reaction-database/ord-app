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
import type { SelectOption, SelectOptions } from 'common/types/selectOptions';
import { SegmentedControl, type SegmentedControlProps } from '@mantine/core';
import { useCallback, useMemo } from 'react';

interface AppSegmentedControlProps<T>
  extends Omit<SegmentedControlProps, 'onChange' | 'data' | 'defaultValue' | 'value'> {
  options: SelectOptions<T>;
  defaultValue?: T;
  value?: T;
  onChange: (value: T) => void;
}

export function AppSegmentedControl<T>({
  value,
  defaultValue,
  onChange,
  options,
  ...rest
}: Readonly<AppSegmentedControlProps<T>>) {
  const stringOptions = useMemo(() => options.map(option => ({ label: option.label, value: option.label })), [options]);
  const stringDefaultValue = options.find(option => option.value === defaultValue)?.label || undefined;
  const stringValue = options.find(option => option.value === value)?.label || undefined;
  const handleChange = useCallback(
    (stringValue: string) => {
      const value = (options.find(option => option.label === stringValue) as SelectOption<T>).value;
      onChange(value);
    },
    [onChange, options],
  );

  return (
    <SegmentedControl
      value={stringValue}
      defaultValue={stringDefaultValue}
      onChange={handleChange}
      data={stringOptions}
      {...rest}
    />
  );
}
