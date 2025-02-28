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
import { useMemo } from 'react';
import classes from './GroupsListWithRoles.module.scss';
import { Counter } from 'common/components/display/Counter/Counter.tsx';
import { Popover } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { GroupItem } from 'store/entities/groups/groups.types.ts';
import { USER_ROLES } from 'common/types';

interface GroupsListWithRolesProps {
  data: Array<GroupItem>;
}

interface GroupNameRoleProps {
  name: string;
  role: string;
}

const GroupNameRole = ({ name, role }: Readonly<GroupNameRoleProps>) => (
  <>
    <span className={classes.groupName}>{name}: </span>
    <span className={classes.groupRole}>{role} </span>
  </>
);

export function GroupsListWithRoles({ data = [] }: Readonly<GroupsListWithRolesProps>) {
  const [opened, { close, open }] = useDisclosure(false);
  const sortedGroups = useMemo(() => {
    return [...data].sort((a, b) => {
      if (a.role === USER_ROLES.ADMIN && b.role !== USER_ROLES.ADMIN) return -1;
      if (b.role === USER_ROLES.ADMIN && a.role !== USER_ROLES.ADMIN) return 1;
      return 0;
    });
  }, [data]);

  const [firstGroup, ...remainingGroups] = sortedGroups;

  const tooltipContent = useMemo(() => {
    return remainingGroups.map(group => (
      <div key={group.id}>
        <GroupNameRole
          name={group.name}
          role={group.role}
        />
      </div>
    ));
  }, [remainingGroups]);

  if (sortedGroups.length === 0) {
    return null;
  }

  const groupName = firstGroup?.name || '';
  const groupRole = firstGroup?.role || '';
  const numberOfRemainingGroups = remainingGroups.length;

  return (
    <>
      <GroupNameRole
        name={groupName}
        role={groupRole}
      />
      {numberOfRemainingGroups > 0 && (
        <Popover
          classNames={{
            dropdown: classes.popoverDropdown,
          }}
          position="right-start"
          shadow="md"
          opened={opened}
        >
          <Popover.Target>
            <button
              onMouseEnter={open}
              onMouseLeave={close}
              className={classes.resetButton}
            >
              <Counter
                amount={'+' + numberOfRemainingGroups}
                color={'blue'}
              />
            </button>
          </Popover.Target>
          <Popover.Dropdown>{tooltipContent}</Popover.Dropdown>
        </Popover>
      )}
    </>
  );
}
