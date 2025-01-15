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
import { Menu, Avatar, Group, Text, Flex, UnstyledButton } from '@mantine/core';
import { domain } from 'common/constants';
import { useAuth } from 'common/hooks/useAuth';
import { useSelector } from 'react-redux';
import { selectSelf } from 'store/users/users.selectors';
import classes from './UserMenu.module.scss';
import { ChevronDownFilledIcon, SignOutIcon } from 'common/icons';

export default function UserMenu() {
  const { logout } = useAuth();
  const user = useSelector(selectSelf);

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
              src={user.picture}
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
          onClick={() =>
            logout({
              logoutParams: {
                returnTo: domain,
              },
            })
          }
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  ) : null;
}
