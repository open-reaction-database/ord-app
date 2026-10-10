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
import { Menu, ThemeIcon } from '@mantine/core';
import { CopyIcon } from 'common/icons';
import { copyToClipboard } from 'common/utils/copyToClipboard.ts';
import classes from './copyButton.module.scss';

interface CopyButtonProps {
  options: Array<CopyButtonOptions>;
}

export interface CopyButtonOptions {
  label: string;
  value: string;
}

export function CopyButton({ options }: Readonly<CopyButtonProps>) {
  return (
    <Menu
      width={160}
      trigger="hover"
      position="bottom"
      classNames={{
        dropdown: classes.dropdown,
        item: classes.menuItem,
      }}
    >
      <Menu.Target>
        <ThemeIcon
          className={classes.target}
          variant="transparent"
        >
          <CopyIcon />
        </ThemeIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {options.map(option => (
          <Menu.Item
            key={option.label}
            onClick={() => copyToClipboard(option.value)}
          >
            {option.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
