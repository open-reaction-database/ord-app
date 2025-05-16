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
import type { ReactionEntityTitleConstructorProps, ReactionEntityTitleProps } from './reactionEntityTitle.types.ts';
import { Flex, Text, Title } from '@mantine/core';
import { ReactionEntityDelete } from 'features/reactions/ReactionEntities/ReactionEntityDelete/ReactionEntityDelete.tsx';
import { ReactionNodeValidationResult } from '../../ReactionInteractions/ReactionNodeValidationResult/ReactionNodeValidationResult.tsx';

export function ReactionEntityTitle({
  reactionId,
  pathComponents,
  entityName,
  hasDelete,
  description,
}: Readonly<ReactionEntityTitleProps & ReactionEntityTitleConstructorProps>) {
  return (
    <Flex
      direction="column"
      gap="xs"
    >
      <Flex
        align="center"
        gap="xs"
      >
        <Title order={2}>{entityName}</Title>
        {hasDelete && (
          <ReactionEntityDelete
            entityName={entityName}
            reactionId={reactionId}
            pathComponents={pathComponents}
            shouldCloseSidebar
          />
        )}
        <ReactionNodeValidationResult pathComponents={pathComponents} />
      </Flex>
      {description && <Text component="span">{description}</Text>}
    </Flex>
  );
}
