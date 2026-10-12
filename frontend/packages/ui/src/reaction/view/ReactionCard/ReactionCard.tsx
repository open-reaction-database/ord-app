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
import clsx from 'clsx';
import classes from './reactionCard.module.scss';
import { useMemo, type ReactNode, type MutableRefObject } from 'react';
import typographyClasses from '#theme/typography.module.scss';
import { ReactionPreview } from '#reaction/view/ReactionPreview/ReactionPreview.tsx';
import { useReactionSnapshotField } from '#reaction/provider/reactionProvider.hooks.ts';

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
  title: ReactNode;
  actions: ReactNode;
  previewRef?: MutableRefObject<HTMLDivElement | null>;
  isInvalid?: boolean;
  /** Shows the provenance, the summary, and the conditions over the preview's arrow. */
  showDetails?: boolean;
}

export function ReactionCard({
  title,
  actions,
  previewRef,
  isInvalid,
  showDetails = false,
}: Readonly<ReactionCardProps>) {
  const summary = useReactionSnapshotField('summary');
  if (!summary) {
    return null;
  }

  return (
    <Paper
      className={clsx(classes.container, { [classes.invalidBorder]: isInvalid })}
      radius="sm"
      p="lg"
    >
      <div className={clsx(classes.topContainer, typographyClasses.oneLineTextWrapper)}>
        <div
          className={clsx(classes.titleContainer, typographyClasses.oneLineTextWrapper)}
        >
          <Flex
            align="center"
            gap="4"
          >
            {title}
          </Flex>

          {showDetails && (
            <DescriptorsList
              title="Provenance"
              items={summary.provenance}
            />
          )}
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
        ref={previewRef}
        showDetails={showDetails}
      />
      {showDetails && (
        <DescriptorsList
          title="Summary"
          items={summary.summary}
        />
      )}
    </Paper>
  );
}
