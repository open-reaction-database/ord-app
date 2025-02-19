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
import type { SelectOptions } from 'common/types/selectOptions';
import { Input, SegmentedControl, type SegmentedControlProps } from '@mantine/core';
import { useUncontrolledSelect } from 'common/hooks/useUncontrolledSelect';
import type { ReactNode } from 'react';
import { inputWrapperClasses } from 'common/components/display/InputWrapper';

interface AppSegmentedControlProps<T>
  extends Omit<SegmentedControlProps, 'onChange' | 'data' | 'defaultValue' | 'value'> {
  options: SelectOptions<T>;
  defaultValue?: T;
  value?: T;
  onChange: (value: T) => void;
  label?: ReactNode;
}

export function AppSegmentedControl<T>({
  value,
  defaultValue,
  onChange,
  options,
  label,
  ...rest
}: Readonly<AppSegmentedControlProps<T>>) {
  const inputProps = useUncontrolledSelect(false, options, value, defaultValue, onChange);
  return (
    <Input.Wrapper
      label={label}
      className={inputWrapperClasses.inputWrapper}
    >
      <SegmentedControl
        {...inputProps}
        {...rest}
      />
    </Input.Wrapper>
  );
}
