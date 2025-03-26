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
import { Flex, Title } from '@mantine/core';
import { useContext, useMemo } from 'react';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import type { EntityListItemProps } from './entityListItem.types.ts';
import { KeyValueDisplay } from 'common/components/display/KeyValueDisplay/KeyValueDisplay.tsx';
import { reactionContext } from 'features/reactions/reactions.context.ts';

export function EntityListItem<T>({
  entityKey,
  entity,
  entityField,
  title,
  requiredFields,
  optionalFields,
}: Readonly<EntityListItemProps<T>>) {
  const { ViewDeleteButtonsComponent } = useContext(reactionContext);
  const { pathComponents } = useContext(reactionEntityContext);
  const itemPathComponents = useMemo(() => {
    return [...pathComponents, entityField, entityKey];
  }, [entityField, entityKey, pathComponents]);

  const titleText = useMemo(() => {
    const humanFriendlyKey = typeof entityKey === 'string' ? entityKey : `${entityKey + 1}`;
    return typeof title === 'function' ? title(entity) : `${title} ${humanFriendlyKey}`;
  }, [title, entity, entityKey]);

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
        <ViewDeleteButtonsComponent
          entityName={titleText}
          pathComponents={itemPathComponents}
        />
      </Flex>
      {requiredFields.map(({ label, render }) => (
        <KeyValueDisplay
          key={label}
          label={label}
          value={render(entity)}
          multiline
        />
      ))}
      {optionalFields?.map(({ label, render }) => {
        const value = render(entity);
        return value ? (
          <KeyValueDisplay
            key={label}
            label={label}
            value={render(entity)}
            multiline
          />
        ) : null;
      })}
    </Flex>
  );
}
