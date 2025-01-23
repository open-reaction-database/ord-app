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
import { Avatar, Flex, Group, Loader, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { RoleSelector } from '../RoleSelector/RoleSelector';
import {
  selectEditingGroupId,
  selectGroupMembersByGroupId,
  selectIsGroupUpdating,
  selectMemberRoles,
} from 'store/groups/groups.selectors';
import { useAppDispatch } from 'store/useAppDispatch';
import { getGroupMembers, removeGroupMembers, updateGroupMembers } from 'store/groups/groups.thunks';
import { USER_ROLES } from 'common/types';
import { PermissionsModal } from '../PermissionModal/PermissionModal';
import { InfoCircleIcon } from 'common/icons';
import classes from './GroupMembersList.module.scss';
import { UserDataField } from './UserDataField/UserDataField';

export function GroupMembersList() {
  const dispatch = useAppDispatch();
  const [opened, { open, close }] = useDisclosure(false);
  const groupId = useSelector(selectEditingGroupId);
  const groupMembers = useSelector(selectGroupMembersByGroupId(Number(groupId)));
  const isGroupUpdating = useSelector(selectIsGroupUpdating);
  const { isAdmin, hasTwoAdmins } = useSelector(selectMemberRoles);

  useEffect(() => {
    if (!groupMembers && groupId) {
      dispatch(getGroupMembers(groupId));
    }
  }, [dispatch, groupId, groupMembers]);

  const handleRoleChange = (user_id: number, role: USER_ROLES) => {
    dispatch(updateGroupMembers({ user_id, role }));
  };

  const handleMemberRemove = (id: number) => {
    dispatch(removeGroupMembers([id]));
  };

  return (
    <div className={classes.container}>
      <Flex
        align="center"
        justify="space-between"
      >
        <Flex
          align="center"
          gap="8"
        >
          <div className={classes.title}>Members</div>
          <div className={classes.counter}>{groupMembers?.length}</div>
        </Flex>
        <Group
          className={classes.rolesButton}
          onClick={open}
          gap="4px"
        >
          <InfoCircleIcon />
          <span>Roles and Permissions</span>
        </Group>
      </Flex>

      {!groupMembers?.length ? (
        <Flex justify="center">
          <Loader />
        </Flex>
      ) : (
        groupMembers.map(({ role, user: { id, avatar_url, name, email, external_id, orcid_id } }) => (
          <div
            key={external_id}
            className={classes.userInfoContainer}
          >
            <Flex
              align="center"
              gap="12"
            >
              <Avatar
                radius="xl"
                src={avatar_url}
                size="32px"
              />
              <Flex
                direction="column"
                gap="4"
              >
                <div>{name}</div>
                <Flex gap="8">
                  <UserDataField
                    fieldName="ORCID"
                    value={orcid_id}
                  />

                  <UserDataField
                    fieldName="e-mail"
                    value={email}
                  />
                </Flex>
              </Flex>
            </Flex>

            {isAdmin && (role !== USER_ROLES.ADMIN || hasTwoAdmins) ? (
              <RoleSelector
                value={role}
                onChange={role => handleRoleChange(id, role)}
                onRemove={() => handleMemberRemove(id)}
                disabled={isGroupUpdating}
              />
            ) : (
              <Text className={classes.role}>{role}</Text>
            )}
          </div>
        ))
      )}

      <PermissionsModal
        opened={opened}
        onClose={close}
      />
    </div>
  );
}
