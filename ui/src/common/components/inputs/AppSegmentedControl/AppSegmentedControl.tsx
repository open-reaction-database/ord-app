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
import { useMemo, type ReactNode } from 'react';
import { inputWrapperClasses } from 'common/components/display/InputWrapper';

interface AppSegmentedControlProps extends Omit<SegmentedControlProps, 'data'> {
  options: SelectOptions;
  label?: ReactNode;
}

export function AppSegmentedControl({
  value,
  defaultValue,
  onChange,
  options,
  label,
  ...rest
}: Readonly<AppSegmentedControlProps>) {
  const data = useMemo(() => {
    return options.reduce((acc: Array<string>, option) => {
      if (typeof option === 'object') {
        return acc.concat(option.items);
      }
      return acc.concat(option);
    }, []);
  }, [options]);

  return (
    <Input.Wrapper
      label={label}
      className={inputWrapperClasses.inputWrapper}
    >
      <SegmentedControl
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        data={data}
        {...rest}
      />
    </Input.Wrapper>
  );
}
