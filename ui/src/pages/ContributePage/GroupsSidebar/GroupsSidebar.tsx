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
import { useEffect, useState, type MouseEvent } from 'react';
import { Button, Flex, Paper, Title } from '@mantine/core';
import { AddCircleIcon } from 'common/icons';
import { useDisclosure } from '@mantine/hooks';
import { InputModal } from 'common/components/InputModal/InputModal';
import { GroupsDrawer } from 'pages/ContributePage/GroupsSidebar/GroupsDrawer/GroupsDrawer';
import { useAppDispatch } from 'store/useAppDispatch';
import { createGroup, getGroupList } from 'store/groups/groups.thunks';
import { type Group } from 'store/groups/groups.types';
import { GroupsList } from 'pages/ContributePage/GroupsSidebar/GroupsList/GroupsList';
import classes from './GroupsSidebar.module.scss';

export function GroupsSidebar() {
  const dispatch = useAppDispatch();

  const [opened, { open, close }] = useDisclosure(false);
  const [openedDrawer, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [selectedGroup, setSelectedGroup] = useState<Group>();

  useEffect(() => {
    dispatch(getGroupList());
  }, [dispatch]);

  const handleGroupAddition = async (value: string) => {
    dispatch(createGroup(value));
  };

  const handleGroupsDrawerOpen = (e: MouseEvent, group: Group) => {
    e.stopPropagation();
    setSelectedGroup(group);
    openDrawer();
  };

  return (
    <>
      <Paper
        className={classes.container}
        radius="sm"
        p="sm"
      >
        <Flex
          align="center"
          justify="space-between"
        >
          <Title order={3}>My Groups</Title>
          <Button
            className={classes.addGroupButton}
            variant="transparent"
            leftSection={<AddCircleIcon />}
            onClick={open}
          >
            Group
          </Button>
        </Flex>

        <GroupsList onEdit={handleGroupsDrawerOpen} />
      </Paper>

      <InputModal
        opened={opened}
        onClose={close}
        onSubmit={handleGroupAddition}
        title="Create Group"
        inputLabel="Group name"
      />

      {selectedGroup && (
        <GroupsDrawer
          opened={openedDrawer}
          onClose={closeDrawer}
          groupId={selectedGroup.id}
        />
      )}
    </>
  );
}
