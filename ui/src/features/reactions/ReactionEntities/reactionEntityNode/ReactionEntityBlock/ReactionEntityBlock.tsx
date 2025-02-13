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
import { Flex, Title } from '@mantine/core';
import type { ReactionFormBlock } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { useReactionEntityLabel } from 'features/reactions/ReactionEntities/reactionEntityNode/useReactionEntityLabel.tsx';
import classes from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBlock/reactionEntityBlock.module.scss';
import { ReactionEntityBaseNode } from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBaseNode/ReactionEntityBaseNode.tsx';
import type { PropsWithChildren, ReactNode } from 'react';

interface ReactionEntityBlockProps extends PropsWithChildren {
  renderedTitle: ReactNode;
}

export function ReactionEntityBlock({
  renderedTitle,
  children,
}: Readonly<PropsWithChildren<ReactionEntityBlockProps>>) {
  return (
    <>
      {renderedTitle}
      <Flex
        direction="column"
        className={classes.list}
        gap="sm"
      >
        {children}
      </Flex>
    </>
  );
}

interface ReactionEntityBlockTitleProps {
  leftSection: ReactNode;
  rightSection?: ReactNode;
}

export function ReactionEntityBlockTitle({ leftSection, rightSection }: Readonly<ReactionEntityBlockTitleProps>) {
  return (
    <Flex
      className={classes.wrapper}
      justify="space-between"
    >
      <Flex
        align="center"
        gap="xs"
      >
        {leftSection}
      </Flex>
      {rightSection && (
        <Flex
          align="center"
          gap="xs"
        >
          {rightSection}
        </Flex>
      )}
    </Flex>
  );
}

export function ReactionEntityBlockNode({ node, formMethods }: Readonly<ReactionEntityNodeProps<ReactionFormBlock>>) {
  const title = useReactionEntityLabel(node.title);
  return (
    <ReactionEntityBlock renderedTitle={<ReactionEntityBlockTitle leftSection={<Title order={3}>{title}</Title>} />}>
      {node.fields.map((field, index) => (
        <ReactionEntityBaseNode
          key={index}
          node={field}
          formMethods={formMethods}
        />
      ))}
    </ReactionEntityBlock>
  );
}
