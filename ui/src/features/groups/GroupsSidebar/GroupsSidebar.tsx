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
import { Button, Flex, Paper, Title } from '@mantine/core';
import { AddCircleIcon } from 'common/icons';
import { useDisclosure } from '@mantine/hooks';
import { InputModal } from 'common/components/InputModal/InputModal.tsx';
import { GroupsDrawer } from 'features/groups/GroupsSidebar/GroupsDrawer/GroupsDrawer.tsx';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { createGroup } from 'store/entities/groups/groups.thunks.ts';
import { GroupsList } from 'features/groups/GroupsList/GroupsList.tsx';
import classes from './GroupsSidebar.module.scss';

export function GroupsSidebar() {
  const dispatch = useAppDispatch();
  const [opened, { open, close }] = useDisclosure(false);

  const handleGroupAddition = async (value: string) => {
    dispatch(createGroup(value));
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
          <Title order={4}>My Groups</Title>
          <Button
            className={classes.addGroupButton}
            variant="transparent"
            leftSection={<AddCircleIcon />}
            onClick={open}
          >
            Group
          </Button>
        </Flex>

        <GroupsList />
      </Paper>
      {opened && (
        <InputModal
          onClose={close}
          onSubmit={handleGroupAddition}
          title="Create Group"
          inputLabel="Group name"
        />
      )}
      <GroupsDrawer />
    </>
  );
}
