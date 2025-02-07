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
import { useCallback, useMemo, type ChangeEvent } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import type { SelectOption, SelectOptions } from '../types/selectOptions';

interface UncontrolledSelectProps<T> {
  data: SelectOptions<string>;
  value?: string;
  onChange: (value: T) => void;
}

export function useUncontrolledSelect<T>(
  isEvent: true,
  options: SelectOptions<T>,
  value?: T,
  defaultValue?: T,
  onChange?: (value: T) => void,
): UncontrolledSelectProps<ChangeEvent<HTMLSelectElement>>;
export function useUncontrolledSelect<T>(
  isEvent: false,
  options: SelectOptions<T>,
  value?: T,
  defaultValue?: T,
  onChange?: (value: T) => void,
): UncontrolledSelectProps<string>;

export function useUncontrolledSelect<T>(
  isEvent: boolean,
  options: SelectOptions<T>,
  value?: T,
  defaultValue?: T,
  onChange?: (value: T) => void,
): UncontrolledSelectProps<string> | UncontrolledSelectProps<ChangeEvent<HTMLSelectElement>> {
  const stringOptions = useMemo(() => options.map(option => ({ label: option.label, value: option.label })), [options]);

  const [uncontrolledValue, uncontrolledOnChange] = useUncontrolled({
    value: value,
    onChange: onChange,
    defaultValue: defaultValue,
  });

  const stringValue = options.find(option => option.value === uncontrolledValue)?.label ?? undefined;

  const handleChange = useCallback(
    (param: string | ChangeEvent<HTMLSelectElement>) => {
      const stringValue = isEvent ? (param as ChangeEvent<HTMLSelectElement>).target.value : param;
      const value = (options.find(option => option.label === stringValue) as SelectOption<T>).value;
      uncontrolledOnChange(value);
    },
    [uncontrolledOnChange, options, isEvent],
  );

  return {
    data: stringOptions,
    value: stringValue,
    onChange: handleChange,
  };
}
