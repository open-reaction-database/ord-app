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
import { Flex, Paper, Title } from '@mantine/core';
import classes from './reactionCard.module.scss';
import { useSelector } from 'react-redux';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { useMemo, useRef, type ReactNode } from 'react';
import { typographyClasses } from 'common/styling';
import { ReactionPreview } from '../../ReactionPreview/ReactionPreview.tsx';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';

interface DescriptorsListProps {
  title: string;
  items: Record<string, string | number>;
}

function DescriptorsList({ title, items }: Readonly<DescriptorsListProps>) {
  const itemsArray = useMemo(() => Object.entries(items), [items]);

  return (
    <div>
      <Title
        className={typographyClasses.secondary2}
        order={4}
      >
        {title}:
      </Title>
      <Flex gap="xs">
        {itemsArray.map(([key, value], index) => (
          <Flex
            key={key}
            gap="xs"
          >
            <span className={classes.infoTitle}>{key}: </span>
            <span>{value}</span>
            {index !== itemsArray.length - 1 && <span>&middot;</span>}
          </Flex>
        ))}
      </Flex>
    </div>
  );
}

interface ReactionCardProps {
  id: ReactionId;
  title: ReactNode;
  actions: ReactNode;
}

export function ReactionCard({ id, title, actions }: Readonly<ReactionCardProps>) {
  const reaction = useSelector(selectReactionById(id));
  const previewRef = useRef<HTMLDivElement | null>(null);

  return (
    <Paper
      className={classes.container}
      radius="sm"
      p="lg"
    >
      <div className={classes.topContainer}>
        <div className={classes.titleContainer}>
          <Flex
            align="center"
            gap="4"
          >
            {title}
          </Flex>

          <DescriptorsList
            title="Provenance"
            items={reaction.summary.provenance}
          />
        </div>
        <Flex
          align="flex-start"
          justify="flex-end"
          className={classes.buttonContainer}
        >
          <Flex
            align="center"
            gap="sm"
          >
            {actions}
          </Flex>
        </Flex>
      </div>
      <ReactionPreview
        reaction={reaction}
        ref={previewRef}
      />
      <DescriptorsList
        title="Summary"
        items={reaction.summary.summary}
      />
    </Paper>
  );
}
