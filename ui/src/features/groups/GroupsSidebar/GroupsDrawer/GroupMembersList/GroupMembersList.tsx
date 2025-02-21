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
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { Avatar, Flex, Group, Loader, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { RoleSelector } from '../RoleSelector/RoleSelector.tsx';
import {
  selectGroupMembersByGroupId,
  selectIsGroupUpdating,
  selectMemberRoles,
} from 'store/entities/groups/groups.selectors.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { removeGroupMembers, updateGroupMembers } from 'store/entities/groups/groups.thunks.ts';
import { USER_ROLES } from 'common/types';
import { PermissionsModal } from '../PermissionModal/PermissionModal.tsx';
import { InfoCircleIcon } from 'common/icons';
import classes from './GroupMembersList.module.scss';
import { UserDataField } from './UserDataField/UserDataField.tsx';
import { selectEditingGroupId, selectIsAddingMember } from 'store/features/groups/groups.selectors.ts';

const roleOrder = [USER_ROLES.ADMIN, USER_ROLES.EDITOR, USER_ROLES.VIEWER];

export function GroupMembersList() {
  const dispatch = useAppDispatch();
  const [opened, { open, close }] = useDisclosure(false);
  const { isAdmin, hasTwoAdmins } = useSelector(selectMemberRoles);
  const groupId = useSelector(selectEditingGroupId);
  const groupMembers = useSelector(selectGroupMembersByGroupId(Number(groupId)));
  const isGroupUpdating = useSelector(selectIsGroupUpdating);
  const isAddingMember = useSelector(selectIsAddingMember);

  const handleRoleChange = (user_id: number, role: USER_ROLES) => {
    dispatch(updateGroupMembers({ user_id, role }));
  };

  const handleMemberRemove = (id: number) => {
    dispatch(removeGroupMembers([id]));
  };

  const sortedGroupMembers = useMemo(() => {
    if (!groupMembers || groupMembers.length === 0) return [];

    return [...groupMembers].sort((memberA, memberB) => {
      const roleDiff = roleOrder.indexOf(memberA.role) - roleOrder.indexOf(memberB.role);
      if (roleDiff !== 0) return roleDiff;

      const nameA = memberA.user?.name || '';
      const nameB = memberB.user?.name || '';
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
  }, [groupMembers]);

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
          {isAddingMember ? <Loader size="sm" /> : <div className={classes.counter}>{groupMembers?.length}</div>}
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

      {isGroupUpdating ? (
        <Flex justify="center">
          <Loader />
        </Flex>
      ) : (
        sortedGroupMembers.map(({ role, user: { id, avatar_url, name, email, external_id, orcid_id } }) => (
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
