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
import classes from './RoleSelector.module.scss';

interface RoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

export function RoleSelector({ value, onChange, onRemove }: Readonly<RoleSelectorProps>) {
  const roles = ['Admin', 'Editor', 'Viewer'];

  return (
    <Menu
      classNames={{
        dropdown: classes.dropdown,
        item: classes.menuItem,
        itemSection: classes.menuItemSection,
      }}
      width={160}
    >
      <Menu.Target>
        <Button
          variant="default"
          rightSection={<ChevronDownIcon />}
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
              onClick={() => onChange(role)}
              leftSection={isSelected ? <CheckIcon /> : <div className={classes.iconPlaceholder} />}
            >
              {role}
            </Menu.Item>
          );
        })}

        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<RemoveIcon />}
          onClick={onRemove}
        >
          Remove
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
