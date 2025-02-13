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
import { Button, Flex, Popover, type PopoverProps, Text } from '@mantine/core';
import { AlertCircleIcon } from 'common/icons';
import classes from './ConfirmPopover.module.scss';

interface ConfirmPopoverProps extends PopoverProps {
  target: JSX.Element;
  title: string;
  text: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmPopover({ target, title, text, onConfirm, onCancel, ...rest }: Readonly<ConfirmPopoverProps>) {
  return (
    <Popover
      classNames={{
        dropdown: classes.dropdown,
      }}
      offset={16}
      withArrow
      {...rest}
    >
      <Popover.Target>{target}</Popover.Target>

      <Popover.Dropdown>
        <Flex
          direction="column"
          gap="16px"
        >
          <Flex
            direction="column"
            gap="4px"
          >
            <Flex
              align="center"
              gap="4px"
            >
              <AlertCircleIcon className={classes.alertIcon} />
              <Text fw={700}>{title}</Text>
            </Flex>
            <Text>{text}</Text>
          </Flex>

          <Flex
            justify="flex-end"
            align="center"
            gap="8px"
          >
            <Button
              className={classes.popoverButton}
              variant="default"
              size="xs"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              className={classes.popoverButton}
              size="xs"
              onClick={onConfirm}
            >
              OK
            </Button>
          </Flex>
        </Flex>
      </Popover.Dropdown>
    </Popover>
  );
}
