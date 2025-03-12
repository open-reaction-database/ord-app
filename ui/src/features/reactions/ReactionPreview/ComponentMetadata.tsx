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
import type {
  ReactionInputComponent,
  ReactionProduct,
} from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { useMemo } from 'react';
import { Flex, Text } from '@mantine/core';

interface ComponentMetadataProps {
  component: ReactionInputComponent | ReactionProduct;
}

export function ComponentMetadata({ component }: Readonly<ComponentMetadataProps>) {
  const name = useMemo(() => {
    return (component.identifiers || []).find(identifier => identifier.type === 'NAME');
  }, [component]);

  return (
    <Flex
      direction="column"
      justify="flex-end"
    >
      {name?.value && <Text size="xs">{name.value}</Text>}
      {'amount' in component && component?.amount && (
        <Text size="xs">
          {component.amount.value} {component.amount.units}
        </Text>
      )}
      {component?.reactionRole && <Text size="xs">{component.reactionRole}</Text>}
    </Flex>
  );
}
