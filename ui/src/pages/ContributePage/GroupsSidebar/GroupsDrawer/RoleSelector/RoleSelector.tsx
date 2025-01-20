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
import { Menu, Button, Popover, Flex, Text } from '@mantine/core';
import { AlertCircleIcon, CheckIcon, ChevronDownIcon, RemoveIcon } from 'common/icons';
import classes from './RoleSelector.module.scss';
import { USER_ROLES } from 'common/types/roles';
import { useDisclosure } from '@mantine/hooks';

interface RoleSelectorProps {
  value: USER_ROLES;
  onChange: (value: USER_ROLES) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function RoleSelector({ value, onChange, onRemove, disabled }: Readonly<RoleSelectorProps>) {
  const [opened, { open, close }] = useDisclosure(false);
  const [openedConfirm, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);
  const roles = Object.values(USER_ROLES);

  const handleMenuClose = () => {
    closeConfirm();
    close();
  };

  const handleRoleChange = (role: USER_ROLES) => {
    onChange(role);
    handleMenuClose();
  };

  const handleConfirm = () => {
    onRemove();
    handleMenuClose();
  };

  return (
    <Menu
      classNames={{
        dropdown: classes.dropdown,
        item: classes.menuItem,
        itemSection: classes.menuItemSection,
      }}
      width={160}
      opened={opened}
      closeOnItemClick={false}
      closeOnClickOutside={!openedConfirm}
      onClose={handleMenuClose}
    >
      <Menu.Target>
        <Button
          className={classes.target}
          variant="default"
          rightSection={<ChevronDownIcon />}
          onClick={open}
          justify="space-between"
          disabled={disabled}
        >
          {value}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {roles.map(role => {
          const isSelected = value === role;
          return (
            <Menu.Item
              className={isSelected ? classes.selectedOption : undefined}
              key={role}
              onClick={() => handleRoleChange(role)}
              leftSection={isSelected ? <CheckIcon /> : <div className={classes.iconPlaceholder} />}
            >
              {role}
            </Menu.Item>
          );
        })}

        <Menu.Divider />

        <Popover
          opened={openedConfirm}
          classNames={{
            dropdown: classes.dropdown,
          }}
          position="right"
          offset={16}
          withArrow
        >
          <Popover.Target>
            <Menu.Item
              color="red"
              leftSection={<RemoveIcon />}
              onClick={openConfirm}
            >
              Remove
            </Menu.Item>
          </Popover.Target>

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
                  <Text fw={700}>Remove user</Text>
                </Flex>
                <Text>Are you sure to remove this user?</Text>
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
                  onClick={closeConfirm}
                >
                  Cancel
                </Button>
                <Button
                  className={classes.popoverButton}
                  size="xs"
                  onClick={handleConfirm}
                >
                  OK
                </Button>
              </Flex>
            </Flex>
          </Popover.Dropdown>
        </Popover>
      </Menu.Dropdown>
    </Menu>
  );
}
