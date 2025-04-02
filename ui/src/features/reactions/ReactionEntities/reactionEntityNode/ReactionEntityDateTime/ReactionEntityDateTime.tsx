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
import type { ReactionEntityNodeProps } from 'features/reactions/ReactionEntities/reactionEntityNode/reactionEntityNode.types.ts';
import type { ReactionFormDateTime } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { useReactionEntityLabel } from 'features/reactions/ReactionEntities/reactionEntityNode/useReactionEntityLabel.tsx';
import { useUncontrolled } from '@mantine/hooks';
import { type DateValue, DateTimePicker } from '@mantine/dates';
import { InputGroup } from 'common/components/inputs/InputGroup/InputGroup.tsx';
import { Input, TextInput } from '@mantine/core';
import { useCallback, useState, type FocusEvent, useContext } from 'react';
import dayjs from 'dayjs';
import { reactionContext } from 'features/reactions/reactions.context.ts';

export function ReactionEntityDateTime({ node, formMethods }: Readonly<ReactionEntityNodeProps<ReactionFormDateTime>>) {
  const label = useReactionEntityLabel(node.wrapperConfig);
  const { isViewOnly } = useContext(reactionContext);

  const [value, onChange] = useUncontrolled({
    ...formMethods.getInputProps(node.name),
  });

  const dateValue = dayjs(value);

  const [isDateValid, setIsDateValid] = useState(dateValue.isValid() || value === null);

  const [temporaryDate, setTemporaryDate] = useState<DateValue>(null);

  const handleDateChange = useCallback(
    (date: DateValue) => {
      const updatedValue = dayjs(date).format('YYYY-MM-DD HH:mm:ss');
      onChange(updatedValue);
    },
    [onChange],
  );

  const handleBlurSelect = (event: FocusEvent<HTMLElement>) => {
    const target = event.target as HTMLInputElement;
    const updatedDate = dayjs(target.value);
    if (updatedDate.isValid()) {
      onChange(updatedDate.format('YYYY-MM-DD HH:mm:ss'));
      setIsDateValid(true);
    }
  };

  return isDateValid ? (
    <DateTimePicker
      key="dateInput"
      value={dateValue.isValid() ? dateValue.toDate() : null}
      placeholder="Date"
      onChange={handleDateChange}
      label={label}
      disabled={isViewOnly}
    />
  ) : (
    <Input.Wrapper label={label}>
      <InputGroup>
        <TextInput
          value={value}
          disabled
        />
        <DateTimePicker
          key="dateInput"
          value={temporaryDate}
          onBlur={handleBlurSelect}
          onChange={setTemporaryDate}
          placeholder="Enter valid date"
          disabled={isViewOnly}
        />
      </InputGroup>
    </Input.Wrapper>
  );
}
