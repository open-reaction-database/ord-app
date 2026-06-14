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
import { Badge, Flex, Text, Tooltip } from '@mantine/core';
import classes from './reactionPreview.module.scss';
import { useMemo } from 'react';
import type {
  ReactionInputComponent,
  ReactionProduct,
} from 'store/entities/reactions/reactionComponent/reactionComponent.types';
import { ReactionBoolean } from 'store/entities/reactions/reactionEntity/reactionEntity.types';
import { renderValuePrecisionUnit } from 'features/reactions/ReactionView/renderValuePrecisionUnit';
import { getProductYieldPercent } from 'common/components/ReactionPreview/reactionPreview.utils';

interface ComponentMetadataProps {
  component: ReactionInputComponent | ReactionProduct;
}

export function ComponentMetadata({ component }: Readonly<ComponentMetadataProps>) {
  const name = useMemo(() => {
    return (component.identifiers || []).find(identifier => identifier.type === 'NAME');
  }, [component]);

  // Products carry a yield as a YIELD measurement; surface it as a bottom-label "% yield". (#598)
  const productYield = useMemo(
    () => ('measurements' in component ? getProductYieldPercent(component) : undefined),
    [component],
  );
  const amount = 'amount' in component ? component.amount : undefined;
  const isLimiting = 'isLimiting' in component && component.isLimiting === ReactionBoolean.True;

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
      {amount && <Text size="xs">{renderValuePrecisionUnit(amount)}</Text>}
      {productYield != null && <Text size="xs">{productYield}% yield</Text>}
      {component?.reactionRole && <Text size="xs">{component.reactionRole}</Text>}
      {isLimiting && (
        <Badge
          size="xs"
          variant="light"
          w="fit-content"
        >
          Limiting reactant
        </Badge>
      )}
    </Flex>
  );
}
