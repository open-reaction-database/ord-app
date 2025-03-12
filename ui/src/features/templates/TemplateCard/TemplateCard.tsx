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
import { Button, Flex, Paper, Title } from '@mantine/core';
import { Link } from 'wouter';
import { CopyButton, type CopyButtonOptions } from 'common/components/interactions/CopyButton/CopyButton.tsx';
import { DownloadIcon } from 'common/icons';
import classes from './TemplateCard.module.scss';
import { useMemo, useRef } from 'react';
import { typographyClasses } from 'common/styling';
import { ReactionPreview } from 'features/reactions/ReactionPreview/ReactionPreview.tsx';
import { RemoveReaction } from 'features/reactions/RemoveReaction/RemoveReaction.tsx';
import type { TemplateWrapper } from 'store/entities/templates/templates.types';
import { downloadTemplateAsJson } from 'common/utils';

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

interface TemplateCardProps {
  id: number;
  template: TemplateWrapper;
}

export function TemplateCard({ id, template }: Readonly<TemplateCardProps>) {
  const reaction = template;
  const previewRef = useRef<HTMLDivElement | null>(null);

  const copyToClipboardOptions: Array<CopyButtonOptions> = [
    { label: 'Copy Template Link', value: `${window.location.href}/templates/${id}` },
    { label: 'Copy Template ID', value: id.toString() },
  ];
  const downloadAsJson = () => {
    downloadTemplateAsJson(reaction, `${reaction.data.reactionId}.json`);
  };

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
            {/* <span className={classes.index}>{index}.</span> */}
            <Link
              className={classes.link}
              to={`~/templates/${id}`}
            >
              {reaction.name}
            </Link>

            <CopyButton options={copyToClipboardOptions} />
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
          <RemoveReaction reactionId={id} />

          <Button
            leftSection={<DownloadIcon />}
            variant="transparent"
            onClick={downloadAsJson}
          >
            Download Template in JSON
          </Button>
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
