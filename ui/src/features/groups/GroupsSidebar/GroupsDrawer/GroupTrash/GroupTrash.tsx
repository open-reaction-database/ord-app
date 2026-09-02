/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Button, Flex, Loader, Table, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ConfirmPopover } from 'common/components/interactions/ConfirmPopover/ConfirmPopover.tsx';
import { formatUtcDateToDisplay } from 'common/utils';
import {
  selectGroupTrash,
  selectIsTrashLoading,
  selectIsTrashUpdating,
} from 'store/entities/groups/groups.selectors.ts';
import {
  emptyGroupTrash,
  getGroupTrash,
  restoreGroupTrashItem,
} from 'store/entities/groups/groups.thunks.ts';
import type {
  TrashItemKind,
  TrashedDataset,
  TrashedReaction,
} from 'store/entities/groups/groups.types.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import classes from './GroupTrash.module.scss';

interface GroupTrashProps {
  groupId: number;
}

interface TrashRow {
  id: number;
  kind: TrashItemKind;
  title: string;
  deletedAt: string;
  deletedBy: string;
}

function datasetRow(item: TrashedDataset): TrashRow {
  return {
    id: item.id,
    kind: 'dataset',
    title: item.name || '(unnamed)',
    deletedAt: item.deleted_at,
    deletedBy: item.deleted_by?.name || 'Unknown',
  };
}

function reactionRow(item: TrashedReaction): TrashRow {
  return {
    id: item.id,
    kind: 'reaction',
    title: item.pb_reaction_id,
    deletedAt: item.deleted_at,
    deletedBy: item.deleted_by?.name || 'Unknown',
  };
}

export function GroupTrash({ groupId }: Readonly<GroupTrashProps>) {
  const dispatch = useAppDispatch();
  const trash = useSelector(selectGroupTrash);
  const isLoading = useSelector(selectIsTrashLoading);
  const isUpdating = useSelector(selectIsTrashUpdating);
  const [emptyConfirmOpened, { open: openEmptyConfirm, close: closeEmptyConfirm }] =
    useDisclosure(false);

  useEffect(() => {
    dispatch(getGroupTrash(groupId));
  }, [dispatch, groupId]);

  const rows = useMemo(
    () => [...trash.datasets.map(datasetRow), ...trash.reactions.map(reactionRow)],
    [trash],
  );

  const handleEmpty = () => {
    dispatch(emptyGroupTrash(groupId));
    closeEmptyConfirm();
  };

  return (
    <section className={classes.container}>
      <Flex
        align="center"
        justify="space-between"
      >
        <Flex
          align="center"
          gap="8"
        >
          <Text fw={600}>Trash</Text>
          <Text className={classes.counter}>{rows.length}</Text>
        </Flex>
        <ConfirmPopover
          opened={emptyConfirmOpened}
          position="left"
          title="Empty trash"
          text="Permanently delete all items in this group's trash? Shared datasets will be permanently deleted for every group."
          onConfirm={handleEmpty}
          onCancel={closeEmptyConfirm}
          target={
            <Button
              color="red"
              variant="subtle"
              size="xs"
              disabled={rows.length === 0 || isUpdating}
              onClick={openEmptyConfirm}
            >
              Empty
            </Button>
          }
        />
      </Flex>

      {isLoading ? (
        <Flex
          justify="center"
          p="lg"
        >
          <Loader />
        </Flex>
      ) : rows.length === 0 ? (
        <Text
          c="dimmed"
          py="md"
        >
          Trash is empty.
        </Text>
      ) : (
        <Table
          className={classes.table}
          verticalSpacing="sm"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Type</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Deleted by</Table.Th>
              <Table.Th>Deleted</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map(row => (
              <Table.Tr key={`${row.kind}-${row.id}`}>
                <Table.Td className={classes.kind}>{row.kind}</Table.Td>
                <Table.Td>{row.title}</Table.Td>
                <Table.Td>{row.deletedBy}</Table.Td>
                <Table.Td>{formatUtcDateToDisplay(row.deletedAt)}</Table.Td>
                <Table.Td>
                  <Button
                    variant="subtle"
                    size="xs"
                    disabled={isUpdating}
                    onClick={() =>
                      dispatch(
                        restoreGroupTrashItem({
                          groupId,
                          kind: row.kind,
                          id: row.id,
                        }),
                      )
                    }
                  >
                    Restore
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </section>
  );
}
