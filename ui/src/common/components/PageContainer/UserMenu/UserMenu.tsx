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
import { useSelector } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { Menu, Avatar, Group, Text, Flex, UnstyledButton } from '@mantine/core';
import { domain } from 'common/constants.ts';
import { selectSelf } from 'store/entities/users/users.selectors.ts';
import { ChevronDownFilledIcon, SignOutIcon } from 'common/icons';
import classes from './UserMenu.module.scss';

export default function UserMenu() {
  const { logout } = useAuth0();
  const user = useSelector(selectSelf);

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: domain,
      },
    });
  };

  return user ? (
    <Menu
      classNames={{
        dropdown: classes.dropdown,
        item: classes.menuItem,
        itemSection: classes.menuItemSection,
      }}
      width={140}
      offset={-4}
    >
      <Menu.Target>
        <UnstyledButton className={classes.target}>
          <Group gap="8px">
            <Avatar
              src={user.avatar_url}
              radius="xl"
              size="28px"
            />

            <Flex align="center">
              <Text>{user.name}</Text>
              <ChevronDownFilledIcon />
            </Flex>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<SignOutIcon />}
          onClick={handleLogout}
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  ) : null;
}
