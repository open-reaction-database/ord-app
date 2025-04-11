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
import { useUncontrolled } from '@mantine/hooks';
import { type DateValue, DateTimePicker } from '@mantine/dates';
import { InputGroup } from 'common/components/inputs/InputGroup/InputGroup.tsx';
import { Anchor, Flex, Input, TextInput } from '@mantine/core';
import { useCallback, useState, type FocusEvent, type MouseEvent, useContext, useMemo } from 'react';
import dayjs from 'dayjs';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import { ReactionValueLabelWrapper } from 'features/reactions/ReactionValueLabelWrapper.tsx';
import { VariableType } from 'store/entities/templates/templates.types.ts';
import classes from './reactionEntityDateTime.module.scss';
import { formatDateFromUser, getDate, getDateFromUser } from 'common/utils';
import { DATE_TIME_FORMAT } from 'common/constants.ts';

interface ReactionEntityDateTimeLabelProps extends Omit<ReactionEntityNodeProps<ReactionFormDateTime>, 'formMethods'> {
  onChange: (value: string) => void;
}

function ReactionEntityDateTimeLabel({ node, onChange }: Readonly<ReactionEntityDateTimeLabelProps>) {
  const { isViewOnly } = useContext(reactionContext);
  const baseLabel = (
    <ReactionValueLabelWrapper
      wrapperConfig={node.wrapperConfig}
      name={node.name}
      type={VariableType.Date}
    />
  );
  const handleNowClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      onChange(dayjs.utc().format(DATE_TIME_FORMAT));
    },
    [onChange],
  );

  return isViewOnly ? (
    baseLabel
  ) : (
    <Flex
      align="center"
      justify="space-between"
      gap="xs"
    >
      {baseLabel}
      <Anchor onClick={handleNowClick}>Now</Anchor>
    </Flex>
  );
}

export function ReactionEntityDateTime({ node, formMethods }: Readonly<ReactionEntityNodeProps<ReactionFormDateTime>>) {
  const { isViewOnly } = useContext(reactionContext);

  const [value, onChange] = useUncontrolled<string>({
    ...formMethods.getInputProps(node.name),
  });

  const label = (
    <ReactionEntityDateTimeLabel
      node={node}
      onChange={onChange}
    />
  );

  const dateValue = useMemo(() => getDate(value), [value]);

  const [isDateValid, setIsDateValid] = useState(dateValue.isValid() || value === null);

  const [temporaryDate, setTemporaryDate] = useState<DateValue>(null);

  const handleDateChange = useCallback(
    (date: DateValue) => {
      if (date) {
        onChange(formatDateFromUser(date));
      }
    },
    [onChange],
  );

  const handleBlurSelect = (event: FocusEvent<HTMLElement>) => {
    const target = event.target as HTMLInputElement;
    const updatedDate = getDateFromUser(target.value);
    if (updatedDate.isValid()) {
      onChange(formatDateFromUser(target.value));
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
      classNames={{ label: classes.label }}
    />
  ) : (
    <Input.Wrapper
      label={label}
      classNames={{ label: classes.label }}
    >
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
