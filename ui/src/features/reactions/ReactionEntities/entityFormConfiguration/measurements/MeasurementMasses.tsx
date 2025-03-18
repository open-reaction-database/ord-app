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
import { TagsInput } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import { useMemo } from 'react';

export function MeasurementMasses({ name, formMethods }: Readonly<ReactionFormCustomProps>) {
  const [values, onChange] = useUncontrolled<Array<number>>({
    ...formMethods.getInputProps(name),
  });

  const handleChange = (value: Array<string | number>) => {
    const numericValues = value
      .map(item => (typeof item === 'string' ? parseFloat(item) : item))
      .filter(item => !isNaN(item));
    onChange(numericValues);
  };

  const stringValues = useMemo(() => {
    return (values || []).map(item => item.toString());
  }, [values]);

  return (
    <TagsInput
      label="EIC Masses"
      placeholder="Type to add unique"
      description="Only numbers are allowed."
      value={stringValues}
      onChange={handleChange}
    />
  );
}
