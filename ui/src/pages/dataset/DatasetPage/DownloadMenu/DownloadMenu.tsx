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
import { Menu } from '@mantine/core';
import { DownloadIcon } from 'common/icons';
import classes from './DownloadMenu.module.scss';

export interface DownloadMenuOptions {
  label: string;
  format: string;
}

interface DownloadMenuProps {
  options: DownloadMenuOptions[];
  target: JSX.Element;
  onClick: (format: string) => void;
}

export function DownloadMenu({ options, target, onClick }: Readonly<DownloadMenuProps>) {
  return (
    <Menu
      classNames={{
        dropdown: classes.dropdown,
        item: classes.menuItem,
        itemSection: classes.menuItemSection,
      }}
      width={140}
    >
      <Menu.Target>{target}</Menu.Target>

      <Menu.Dropdown>
        {options.map(option => (
          <Menu.Item
            key={option.format}
            leftSection={<DownloadIcon />}
            onClick={() => onClick(option.format)}
          >
            {option.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
