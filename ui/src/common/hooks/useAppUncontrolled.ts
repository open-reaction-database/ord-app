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
/*
 * MIT License
 *
 * Copyright (c) 2021 Vitaly Rtishchev
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
// Originally copied from the Mantine Library
// https://github.com/mantinedev/mantine/blob/master/packages/%40mantine/hooks/src/use-uncontrolled/use-uncontrolled.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, type ChangeEvent } from 'react';

interface UseUncontrolledInput<T> {
  /** Value for controlled state */
  value?: T;

  /** Initial value for uncontrolled state */
  defaultValue?: T;

  /** Final value for uncontrolled state when value and defaultValue are not provided */
  finalValue?: T;

  /** Controlled state onChange handler */
  onChange?: (value: T, ...payload: Array<any>) => void;
}

export function useAppUncontrolled<T>({
  value,
  defaultValue,
  finalValue,
  onChange = () => {},
}: UseUncontrolledInput<T>): [T, (value: T, ...payload: Array<any>) => void, boolean] {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue !== undefined ? defaultValue : finalValue);

  const handleUncontrolledChange = (val: T | ChangeEvent, ...payload: Array<any>) => {
    if (typeof val === 'object' && val && 'target' in val && 'value' in val.target) {
      const value = val.target.value as T;
      setUncontrolledValue(value);
      onChange?.(value, ...payload);
    } else {
      const value = val as T;
      setUncontrolledValue(value);
      onChange?.(value, ...payload);
    }
  };

  useEffect(() => {
    if (defaultValue !== undefined) {
      setUncontrolledValue(defaultValue);
    }
  }, [setUncontrolledValue, defaultValue]);

  if (value !== undefined) {
    return [value as T, onChange, true];
  }

  return [uncontrolledValue as T, handleUncontrolledChange, false];
}
