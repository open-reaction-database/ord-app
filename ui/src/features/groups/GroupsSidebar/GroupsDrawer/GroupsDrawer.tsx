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
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDisclosure } from '@mantine/hooks';
import { ActionIcon, Drawer, Flex, Text } from '@mantine/core';
import { EditIcon } from 'common/icons';
import { InputModal } from 'common/components/InputModal/InputModal.tsx';
import { getGroupMembers, updateGroup } from 'store/entities/groups/groups.thunks.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { selectGroupById, selectIsGroupUpdating, selectMemberRoles } from 'store/entities/groups/groups.selectors.ts';
import { GroupMembersList } from './GroupMembersList/GroupMembersList.tsx';
import { resetAddMemberErrorAction, setAddMemberInputValueAction } from 'store/entities/groups/groups.actions.ts';
import { AddMemberInput } from './AddMemberInput/AddMemberInput.tsx';
import classes from './GroupsDrawer.module.scss';
import { selectEditingGroupId } from 'store/features/groups/groups.selectors.ts';
import { setEditingGroupIdAction } from 'store/features/groups/groups.actions.ts';

export function GroupsDrawer() {
  const dispatch = useAppDispatch();
  const [openedModal, { open: openModal, close: closeModal }] = useDisclosure(false);

  const groupId = useSelector(selectEditingGroupId) as number;
  const group = useSelector(selectGroupById(groupId));

  const isGroupUpdating = useSelector(selectIsGroupUpdating);
  const { isAdmin } = useSelector(selectMemberRoles);

  const handleGroupRename = async (value: string) => {
    dispatch(updateGroup({ id: group.id, name: value }));
  };

  useEffect(() => {
    if (groupId) {
      dispatch(getGroupMembers(groupId));
    }
  }, [dispatch, groupId]);

  const handleClose = () => {
    dispatch(setAddMemberInputValueAction(''));
    dispatch(resetAddMemberErrorAction());
    dispatch(setEditingGroupIdAction(null));
  };

  return (
    <>
      <Drawer.Root
        opened={!!groupId}
        onClose={handleClose}
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
                <Drawer.Title className={classes.title}>{group?.name}</Drawer.Title>
                <ActionIcon
                  variant="transparent"
                  onClick={openModal}
                  disabled={!isAdmin || isGroupUpdating}
                >
                  <EditIcon className={classes.editIcon} />
                </ActionIcon>
              </Flex>
            </Flex>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body className={classes.body}>
            <AddMemberInput />
            <GroupMembersList />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
      {openedModal && (
        <InputModal
          onClose={closeModal}
          onSubmit={handleGroupRename}
          title="Edit Group Name"
          inputLabel="Group name"
          initialValue={group?.name}
        />
      )}
    </>
  );
}
