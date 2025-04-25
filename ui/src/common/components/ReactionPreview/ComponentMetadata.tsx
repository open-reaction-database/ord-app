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
import { Flex, Text, Tooltip } from '@mantine/core';
import classes from './reactionPreview.module.scss';
import { useMemo } from 'react';
import type {
  ReactionInputComponent,
  ReactionProduct,
} from 'store/entities/reactions/reactionComponent/reactionComponent.types';
import { renderValuePrecisionUnit } from 'features/reactions/ReactionView/renderValuePrecisionUnit';

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
      className={classes.componentsMetadata}
    >
      {name?.value && (
        <Tooltip label={name.value}>
          <Text
            size="xs"
            className={classes.name}
          >
            {name.value}
          </Text>
        </Tooltip>
      )}
      {'amount' in component && component?.amount && (
        <Text size="xs">{renderValuePrecisionUnit(component.amount)}</Text>
      )}
      {component?.reactionRole && <Text size="xs">{component.reactionRole}</Text>}
    </Flex>
  );
}
