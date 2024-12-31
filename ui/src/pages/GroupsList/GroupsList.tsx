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
import { useState, type MouseEvent } from 'react';
import { useSelector } from 'react-redux';
import { ActionIcon, Button, Flex, Input, ScrollArea } from '@mantine/core';
import { selectGroupsList } from 'store/groups/groups.selectors';
import { EmptyIcon, GridViewIcon, GroupArrowIcon, SearchIcon, SettingsIcon } from 'common/icons';
import { type Group } from 'store/groups/groups.types';
import classes from './GroupsList.module.scss';

const GROUP_BUTTON_HEIGHT = 36;

interface GroupsListProps {
  onEdit: (e: MouseEvent, group: Group) => void;
}

export function GroupsList({ onEdit }: Readonly<GroupsListProps>) {
  const groups = useSelector(selectGroupsList);

  const [filterValue, setFilterValue] = useState('');

  const scrollAreaHeight = groups.length > 4 ? GROUP_BUTTON_HEIGHT * 4 : GROUP_BUTTON_HEIGHT * groups.length;

  return groups.length ? (
    <>
      <Input
        classNames={{ input: classes.searchInput }}
        value={filterValue}
        onChange={e => setFilterValue(e.target.value)}
        rightSection={<SearchIcon />}
        placeholder="Search by group"
      />
      <Flex direction="column">
        <Button
          classNames={{ root: classes.groupButton, section: classes.buttonSection }}
          variant="white"
          leftSection={<GridViewIcon />}
          justify="flex-start"
        >
          All Groups
        </Button>

        <ScrollArea
          h={scrollAreaHeight}
          scrollbars="y"
          scrollbarSize={4}
          scrollHideDelay={500}
          type="auto"
        >
          {groups
            .filter(group => group.name.includes(filterValue))
            .map(group => (
              <Button
                classNames={{
                  root: classes.groupButton,
                  label: classes.buttonLabel,
                }}
                key={group.id}
                variant="white"
                justify="flex-start"
              >
                <div className={classes.buttonName}>
                  <GroupArrowIcon />
                  <div title={group.name}>{group.name}</div>
                </div>

                <ActionIcon
                  onClick={e => onEdit(e, group)}
                  variant="white"
                  title="Edit group"
                >
                  <SettingsIcon />
                </ActionIcon>
              </Button>
            ))}
        </ScrollArea>
      </Flex>
    </>
  ) : (
    <div className={classes.emptyContainer}>
      <Flex
        direction="column"
        align="center"
        gap="8"
      >
        <EmptyIcon />
        <div className={classes.emptyText}>There are no groups yet</div>
      </Flex>
    </div>
  );
}
