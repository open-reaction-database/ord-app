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
import { ActionIcon, Button, Divider, Flex, Text, Title } from '@mantine/core';
import { ord } from 'ord-schema-protobufjs';
import { DataTable } from 'common/components/display/DataTable/DataTable.tsx';
import type { MRT_ColumnDef } from 'mantine-react-table';
import { ordMapToKeyValueObject } from 'common/utils/reactionForm/ordMapToKeyValueObject.ts';
import { AddCircleIcon, EditIcon, EmptyIcon, RemoveIcon } from 'common/icons';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { useCallback, useContext } from 'react';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { addReactionPathComponentToList } from 'store/features/reactionForm/reactionForm.actions.ts';
import {
  ReactionEntityBlock,
  ReactionEntityBlockTitle,
} from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';
import { ordCompoundToReactionCompound } from 'store/entities/reactions/reactionsInputs/reactionsInputs.converters.ts';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import { typographyClasses } from 'common/styling';
import type { AppReactionCompound } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import { buildUseSelectItems } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';

const reactionRoleByValue = ordMapToKeyValueObject(ord.ReactionRole.ReactionRoleType);

const columns: Array<MRT_ColumnDef<AppReactionCompound>> = [
  {
    id: 'component',
    header: 'Component',
  },
  {
    id: 'preview',
    header: 'Preview',
  },
  {
    id: 'role',
    header: 'Role',
    Cell: ({ row }) => {
      const { reactionRole } = row.original;
      return reactionRole ? <span>{reactionRoleByValue[reactionRole].label}</span> : null;
    },
  },
  {
    id: 'amount',
    header: 'Amount',
    Cell: ({ row }) => {
      const { value, units } = row?.original?.amount ?? {};
      return (
        <span>
          {value} {units}
        </span>
      );
    },
  },
  {
    id: 'buttons',
    header: '',
    size: 100,
    maxSize: 100,
    Cell: ({ row }) => {
      const { pathComponents } = useContext(reactionEntityContext);
      const dispatch = useAppDispatch();
      const { id } = row;

      const onEdit = useCallback(() => {
        const numericId = parseInt(id);
        const newEntry = [...pathComponents, 'components', numericId];
        dispatch(addReactionPathComponentToList(newEntry));
      }, [id, dispatch, pathComponents]);

      return (
        <Flex gap="sm">
          <ActionIcon
            variant="white"
            color="primary"
            onClick={onEdit}
          >
            <EditIcon />
          </ActionIcon>
          <Divider orientation="vertical" />
          <ActionIcon
            variant="white"
            color="red"
          >
            <RemoveIcon />
          </ActionIcon>
        </Flex>
      );
    },
  },
];

const useSelectData = buildUseSelectItems('components');

export function InputsComponentList() {
  const dispatch = useAppDispatch();
  const { reactionId, pathComponents } = useContext(reactionEntityContext);
  const components = useSelectData() as Array<AppReactionCompound>;
  const length = components.length;

  const onCreateComponent = useCallback(() => {
    const newComponent = ordCompoundToReactionCompound(ord.Compound.toObject(new ord.Compound()));
    const newPath = [...pathComponents, 'components', length];
    dispatch(addUpdateReactionField({ reactionId, pathComponents: newPath, newValue: newComponent }));
    dispatch(addReactionPathComponentToList(newPath));
  }, [dispatch, reactionId, pathComponents, length]);

  return (
    <ReactionEntityBlock
      renderedTitle={
        <ReactionEntityBlockTitle
          leftSection={
            <>
              <Title order={3}>Components</Title>
              <span>·</span>
              {components.length}
            </>
          }
          rightSection={
            <Button
              variant="transparent"
              leftSection={<AddCircleIcon />}
              onClick={onCreateComponent}
            >
              Add component
            </Button>
          }
        />
      }
    >
      {components.length > 0 ? (
        <DataTable
          columns={columns}
          data={components}
        />
      ) : (
        <Flex
          direction="column"
          align="center"
          gap="8"
        >
          <EmptyIcon />
          <Text className={typographyClasses.secondary1}>There are no Components yet</Text>
        </Flex>
      )}
    </ReactionEntityBlock>
  );
}
