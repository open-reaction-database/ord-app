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
import { useEffect, useCallback, type ChangeEvent, type MouseEvent } from 'react';
import { useSelector } from 'react-redux';
import { ActionIcon, Button, Flex, Input, ScrollArea } from '@mantine/core';
import {
  selectGroupSearch,
  selectHaveAnyGroups,
  selectOrderedGroupsList,
} from 'store/entities/groups/groups.selectors.ts';
import { EmptyIcon, GridViewIcon, GroupArrowIcon, SearchIcon, SettingsIcon } from 'common/icons';
import { setGroupSearchAction } from 'store/entities/groups/groups.actions.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { setActiveGroupIdAction, setEditingGroupIdAction } from 'store/features/groups/groups.actions.ts';
import classes from './GroupsList.module.scss';
import { selectActiveGroupId } from 'store/features/groups/groups.selectors.ts';

const GROUP_BUTTON_HEIGHT = 36;

export function GroupsList() {
  const appDispatch = useAppDispatch();
  const groups = useSelector(selectOrderedGroupsList);
  const groupSearch = useSelector(selectGroupSearch);
  const haveAnyGroups = useSelector(selectHaveAnyGroups);
  const selectedGroupId = useSelector(selectActiveGroupId);

  const selectGroup = (groupId: number | null) => {
    if (groupId !== selectedGroupId) {
      appDispatch(setActiveGroupIdAction(groupId));
    }
  };

  const openGroupInformation = useCallback(
    (e: MouseEvent, groupId: number | null) => {
      e.stopPropagation();
      appDispatch(setEditingGroupIdAction(groupId));
    },
    [appDispatch],
  );

  const onSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      appDispatch(setGroupSearchAction(e.target.value));
    },
    [appDispatch],
  );

  useEffect(() => {
    return () => {
      appDispatch(setGroupSearchAction(''));
    };
  }, [appDispatch]);

  const scrollAreaHeight = groups.length > 4 ? GROUP_BUTTON_HEIGHT * 4 : GROUP_BUTTON_HEIGHT * groups.length;

  return haveAnyGroups ? (
    <>
      <Input
        classNames={{ input: classes.searchInput, section: classes.placeholder }}
        value={groupSearch}
        onChange={onSearchChange}
        rightSection={<SearchIcon />}
        placeholder="Search by group"
      />
      <Flex direction="column">
        <Button
          classNames={{ root: classes.groupButton, section: classes.buttonSection }}
          variant="white"
          leftSection={<GridViewIcon />}
          onClick={() => selectGroup(null)}
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
          {groups.map(group => (
            <Button
              classNames={{
                root: classes.groupButton,
                label: classes.buttonLabel,
              }}
              key={group.id}
              variant="white"
              justify="flex-start"
              onClick={() => selectGroup(group.id)}
            >
              <div className={classes.buttonName}>
                <GroupArrowIcon />
                <div title={group.name}>{group.name}</div>
              </div>

              <ActionIcon
                onClick={e => openGroupInformation(e, group.id)}
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
        <div className={classes.placeholder}>There are no groups yet</div>
      </Flex>
    </div>
  );
}
