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
import { ActionIcon, Avatar, Button, Drawer, Flex, Input, Text } from '@mantine/core';
import { EditIcon } from 'common/icons';
import classes from './GroupsDrawer.module.scss';
import { useDisclosure } from '@mantine/hooks';
import { InputModal } from 'common/components/InputModal/InputModal';
import { RoleSelector } from 'pages/RoleSelector/RoleSelector';
import axiosInstance from 'common/config/axiosConfig';
import { getGroupList } from 'store/groups/groups.thunks';
import { useAppDispatch } from 'store/useAppDispatch';
import { useSelector } from 'react-redux';
import { selectGroupById } from 'store/groups/groups.selectors';

interface GroupsDrawerProps {
  opened: boolean;
  onClose: () => void;
  groupId: number;
}

export function GroupsDrawer({ opened, onClose, groupId }: Readonly<GroupsDrawerProps>) {
  const dispatch = useAppDispatch();
  const [openedModal, { open: openModal, close: closeModal }] = useDisclosure(false);
  const group = useSelector(selectGroupById(String(groupId)));

  const handleGroupRename = async (value: string) => {
    await axiosInstance.patch(`/groups/${group.id}`, { name: value });
    dispatch(getGroupList());
  };

  return (
    <>
      <Drawer.Root
        opened={opened}
        onClose={onClose}
        position="right"
        size="65%"
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Header className={classes.header}>
            <Flex
              direction="column"
              gap="4"
            >
              <Text className={classes.subtitle}>Group Management</Text>
              <Flex
                align="center"
                gap="4"
              >
                <Drawer.Title className={classes.title}>{group.name}</Drawer.Title>
                <ActionIcon
                  variant="transparent"
                  onClick={openModal}
                >
                  <EditIcon />
                </ActionIcon>
              </Flex>
            </Flex>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body className={classes.body}>
            <div className={classes.inputContainer}>
              <Input placeholder="Add user by e-mail or ORCID number" />
              <Button className={classes.button}>Add User</Button>
            </div>

            <div className={classes.membersContainer}>
              <Flex
                align="center"
                gap="8"
              >
                <div className={classes.membersTitle}>Members</div>
                <div className={classes.counter}>3</div>
              </Flex>

              <div className={classes.userInfoContainer}>
                <Flex
                  align="center"
                  gap="12"
                >
                  <Avatar radius="xl">JD</Avatar>
                  <Flex
                    direction="column"
                    gap="4"
                  >
                    <div>John Doe</div>
                    <Flex gap="8">
                      <div>
                        <span className={classes.category}>ORCID:</span>
                        <span>0000-0001-5727-2427</span>
                      </div>
                      <div>
                        <span className={classes.category}>e-mail:</span>
                        <span>john-doe@epam.com</span>
                      </div>
                    </Flex>
                  </Flex>
                </Flex>

                <RoleSelector
                  value="Admin"
                  onChange={role => console.log(role)}
                  onRemove={() => console.log('Removed')}
                />
              </div>
            </div>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>

      <InputModal
        opened={openedModal}
        onClose={closeModal}
        onSubmit={handleGroupRename}
        title="Rename Group"
        inputLabel="Group name"
        initialValue={group.name}
      />
    </>
  );
}
