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
import type { ReactionEntityNodeProps } from 'features/reactions/ReactionEntities/reactionEntityNode/reactionEntityNode.types.ts';
import type { ReactionFormList } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import {
  ReactionEntityBlock,
  ReactionEntityBlockTitle,
} from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';
import { useReactionEntityLabel } from 'features/reactions/ReactionEntities/reactionEntityNode/useReactionEntityLabel.tsx';
import { Button, Flex, Title } from '@mantine/core';
import { AddCircleIcon } from 'common/icons';
import { useCallback } from 'react';

interface ReactionEntityAddButtonProps extends Required<Pick<ReactionFormList, 'addItem'>> {
  items: Array<unknown>;
  nextIndex: number;
}

function ReactionEntityAddButton({ items, addItem, nextIndex }: Readonly<ReactionEntityAddButtonProps>) {
  const { label, useCreate } = addItem;
  const onCreate = useCreate();

  const handleCreate = useCallback(() => {
    onCreate(nextIndex, items);
  }, [onCreate, nextIndex, items]);

  return (
    <Button
      variant="transparent"
      leftSection={<AddCircleIcon />}
      onClick={handleCreate}
    >
      {label}
    </Button>
  );
}

export function ReactionEntityList({ node }: Readonly<ReactionEntityNodeProps<ReactionFormList>>) {
  const items = node.useSelectItems() ?? [];
  const title = useReactionEntityLabel(node.title);
  const nextIndex = items.length;
  const { ItemDisplay } = node;

  return (
    <ReactionEntityBlock
      renderedTitle={
        <ReactionEntityBlockTitle
          leftSection={
            <>
              <Title order={3}>{title}</Title>
              <span>·</span>
              {items.length}
            </>
          }
          rightSection={
            node.addItem ? (
              <ReactionEntityAddButton
                addItem={node.addItem}
                items={items}
                nextIndex={nextIndex}
              />
            ) : null
          }
        />
      }
    >
      <Flex
        direction="column"
        gap="sm"
      >
        {items.map((item, index) => (
          // eslint-disable-next-line react/jsx-key
          <ItemDisplay
            entity={item}
            entityKey={node.getKey(item, index)}
          />
        ))}
      </Flex>
    </ReactionEntityBlock>
  );
}
