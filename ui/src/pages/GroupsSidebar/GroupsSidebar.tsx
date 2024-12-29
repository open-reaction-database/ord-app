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
import { type MouseEvent } from 'react';
import { ActionIcon, Button, Flex, Input, Paper, ScrollArea, Title } from '@mantine/core';
import { AddCircleIcon, EmptyIcon, GridViewIcon, GroupArrowIcon, SearchIcon, SettingsIcon } from 'common/icons';
import { useDisclosure } from '@mantine/hooks';
import { InputModal } from 'common/components/InputModal/InputModal';
import classes from './GroupsSidebar.module.scss';
import { GroupsDrawer } from 'pages/GroupsDrawer/GroupsDrawer';

const GROUP_BUTTON_HEIGHT = 36;

export function GroupsSidebar() {
  const [opened, { open, close }] = useDisclosure(false);
  const [openedDrawer, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  const groups = [1, 2, 3];

  const handleGroupAddition = async (value: string) => {
    // Send request
    console.log(value);
  };

  const handleGroupsDrawerOpen = (e: MouseEvent) => {
    e.stopPropagation();
    openDrawer();
  };

  const scrollAreaHeight = groups.length > 4 ? GROUP_BUTTON_HEIGHT * 4 : GROUP_BUTTON_HEIGHT * groups.length;

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

        {groups.length ? (
          <>
            <Input
              classNames={{ input: classes.searchInput }}
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
                scrollbarSize={4}
                scrollHideDelay={500}
              >
                {groups.map(group => (
                  <Button
                    classNames={{
                      root: classes.groupButton,
                      label: classes.buttonLabel,
                    }}
                    key={group}
                    variant="white"
                    justify="flex-start"
                  >
                    <Flex
                      align="center"
                      gap="8"
                    >
                      <GroupArrowIcon />
                      Group {group}
                    </Flex>

                    <ActionIcon
                      onClick={handleGroupsDrawerOpen}
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
        )}
      </Paper>

      <InputModal
        opened={opened}
        onClose={close}
        onSubmit={handleGroupAddition}
        title="Create Group"
        inputLabel="Group name"
      />

      <GroupsDrawer
        opened={openedDrawer}
        onClose={closeDrawer}
        group="New Group"
      />
    </>
  );
}
