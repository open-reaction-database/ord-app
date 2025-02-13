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
import { Menu, Button } from '@mantine/core';
import { CheckIcon, ChevronDownIcon, RemoveIcon } from 'common/icons';
import { USER_ROLES } from 'common/types/roles.ts';
import { useDisclosure } from '@mantine/hooks';
import { ConfirmPopover } from 'common/components/ConfirmPopover/ConfirmPopover.tsx';
import classes from './RoleSelector.module.scss';

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

        <ConfirmPopover
          opened={openedConfirm}
          position="right"
          title="Remove user"
          text="Are you sure to remove this user?"
          onConfirm={handleConfirm}
          onCancel={closeConfirm}
          target={
            <Menu.Item
              color="red"
              leftSection={<RemoveIcon />}
              onClick={openConfirm}
            >
              Remove
            </Menu.Item>
          }
        />
      </Menu.Dropdown>
    </Menu>
  );
}
