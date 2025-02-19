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
import { ActionIcon, Flex, Title } from '@mantine/core';
import { useCallback, useContext, useMemo } from 'react';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { addReactionPathComponentToList } from 'store/features/reactionForm/reactionForm.actions.ts';
import { EditIcon } from 'common/icons';
import { ReactionEntityDelete } from 'features/reactions/ReactionEntities/ReactionEntityDelete/ReactionEntityDelete.tsx';
import type { EntityListItemProps } from './entityListItem.types.ts';
import { InlineKeyValue } from 'common/components/display/InlineKeyValue/InlineKeyValue.tsx';

export function EntityListItem<T>({
  entityKey,
  entity,
  entityName,
  title,
  requiredFields,
}: Readonly<EntityListItemProps<T>>) {
  const dispatch = useAppDispatch();
  const { reactionId, pathComponents } = useContext(reactionEntityContext);
  const itemPathComponents = useMemo(() => {
    return [...pathComponents, entityName, entityKey];
  }, [entityName, entityKey, pathComponents]);

  const titleText = useMemo(() => {
    const humanFriendlyKey = typeof entityKey === 'string' ? entityKey : `${entityKey + 1}`;
    return typeof title === 'function' ? title(entity) : `${title} ${humanFriendlyKey}`;
  }, [title, entity, entityKey]);

  const onEdit = useCallback(() => {
    dispatch(addReactionPathComponentToList(itemPathComponents));
  }, [itemPathComponents, dispatch]);

  return (
    <Flex
      direction="column"
      gap="xs"
    >
      <Flex
        align="center"
        gap="xs"
      >
        <Title order={3}>{titleText}</Title>
        <ActionIcon
          variant="white"
          color="primary"
          onClick={onEdit}
        >
          <EditIcon />
        </ActionIcon>
        <ReactionEntityDelete
          reactionId={reactionId}
          entityName={entityName}
          pathComponents={itemPathComponents}
        />
      </Flex>
      {requiredFields.map(({ label, render }) => (
        <InlineKeyValue
          key={label}
          label={label}
          value={render(entity)}
        />
      ))}
    </Flex>
  );
}
