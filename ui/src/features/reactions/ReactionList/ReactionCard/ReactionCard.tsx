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
import { Link, useParams } from 'wouter';
import { CopyButton, type CopyButtonOptions } from 'common/components/interactions/CopyButton/CopyButton.tsx';
import { CheckListIcon, ChevronDownIcon, DotsIcon, DownloadIcon } from 'common/icons';
import { DownloadMenu } from 'common/components/DownloadMenu/DownloadMenu.tsx';
import classes from './ReactionCard.module.scss';
import { useSelector } from 'react-redux';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { fileDownloadOptions } from 'common/constants.ts';
import { useMemo } from 'react';
import { typographyClasses } from 'common/styling';
import { ReactionPreview } from '../../ReactionPreview/ReactionPreview.tsx';

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
  id: number;
  index: number;
}

export function ReactionCard({ id, index }: Readonly<ReactionCardProps>) {
  const { datasetId } = useParams();
  const reaction = useSelector(selectReactionById(id));

  const copyToClipboardOptions: Array<CopyButtonOptions> = [
    { label: 'Copy Reaction Link', value: `${window.location.href}/reaction/${id}` },
    { label: 'Copy Reaction ID', value: id.toString() },
  ];

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
            <span className={classes.index}>{index}.</span>
            <Link
              className={classes.link}
              to={`~/datasets/${datasetId}/reactions/${id}`}
            >
              {reaction.pb_reaction_id}
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
          direction="column"
          className={classes.buttonContainer}
        >
          <Button
            leftSection={<CheckListIcon />}
            variant="transparent"
          >
            Save as a Template
          </Button>

          <DownloadMenu
            options={fileDownloadOptions}
            url={`/datasets/${datasetId}/reactions/${id}/download`}
            target={
              <Button
                className={classes.target}
                leftSection={<DownloadIcon />}
                rightSection={<ChevronDownIcon />}
                variant="transparent"
              >
                Download Reaction
              </Button>
            }
          />

          <Button
            leftSection={<DotsIcon />}
            variant="transparent"
          >
            More
          </Button>
        </Flex>
      </div>
      <ReactionPreview reaction={reaction} />
      <DescriptorsList
        title="Summary"
        items={reaction.summary.summary}
      />
    </Paper>
  );
}
