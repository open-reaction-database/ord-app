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
import React from 'react';
import { Flex, Modal, Table } from '@mantine/core';
import { CheckCircleIcon, CrossCircleIcon } from 'common/icons';
import classes from './PermissionModal.module.scss';

interface Permission {
  feature: string;
  admin: boolean;
  editor: boolean;
  viewer: boolean;
  category: 'Group' | 'Dataset';
}

const permissionsList: Array<Permission> = [
  { feature: 'Read Group', admin: true, editor: true, viewer: true, category: 'Group' },
  { feature: 'Rename Group', admin: true, editor: false, viewer: false, category: 'Group' },
  { feature: 'Manage Users', admin: true, editor: false, viewer: false, category: 'Group' },
  { feature: 'Add User', admin: true, editor: false, viewer: false, category: 'Group' },
  { feature: 'Read', admin: true, editor: true, viewer: true, category: 'Dataset' },
  { feature: 'Update', admin: true, editor: true, viewer: false, category: 'Dataset' },
  { feature: 'Copy ID & Dataset Hyperlink', admin: true, editor: true, viewer: true, category: 'Dataset' },
  { feature: 'Download', admin: true, editor: true, viewer: true, category: 'Dataset' },
  { feature: 'Delete', admin: true, editor: false, viewer: false, category: 'Dataset' },
  { feature: 'Transfer', admin: true, editor: false, viewer: false, category: 'Dataset' },
];

interface PermissionsModalProps {
  opened: boolean;
  onClose: () => void;
}
interface FeatureIconProps {
  hasAccess: boolean;
}

function FeatureIcon({ hasAccess }: Readonly<FeatureIconProps>) {
  return <Flex>{hasAccess ? <CheckCircleIcon /> : <CrossCircleIcon />}</Flex>;
}

export function PermissionsModal({ opened, onClose }: Readonly<PermissionsModalProps>) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      classNames={{ header: classes.header }}
      title="Roles and Permissions"
      size="730px"
      padding="lg"
    >
      <Table>
        <Table.Thead className={classes.tableHeader}>
          <Table.Tr>
            <Table.Th />
            <Table.Th>Admin</Table.Th>
            <Table.Th>Editor</Table.Th>
            <Table.Th>Viewer</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody className={classes.tableBody}>
          {permissionsList.map((row, index) => {
            const isRowWithHeader = index === 0 || (index > 0 && row.category !== permissionsList[index - 1].category);
            const lastRowInCategory =
              permissionsList[index + 1] && row.category !== permissionsList[index + 1].category;

            return (
              <React.Fragment key={row.feature}>
                {isRowWithHeader && (
                  <Table.Tr className={classes.category}>
                    <Table.Td colSpan={4}>{row.category}</Table.Td>
                  </Table.Tr>
                )}
                <Table.Tr className={lastRowInCategory ? classes.lastRow : ''}>
                  <Table.Td className={classes.featureCell}>{row.feature}</Table.Td>
                  <Table.Td>
                    <FeatureIcon hasAccess={row.admin} />
                  </Table.Td>
                  <Table.Td>
                    <FeatureIcon hasAccess={row.editor} />
                  </Table.Td>
                  <Table.Td>
                    <FeatureIcon hasAccess={row.viewer} />
                  </Table.Td>
                </Table.Tr>
              </React.Fragment>
            );
          })}
        </Table.Tbody>
      </Table>
    </Modal>
  );
}
