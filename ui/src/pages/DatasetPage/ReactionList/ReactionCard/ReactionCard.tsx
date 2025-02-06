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
import { CopyButton, type CopyButtonOptions } from 'common/components/CopyButton/CopyButton';
import { CheckListIcon, ChevronDownIcon, DotsIcon, DownloadIcon } from 'common/icons';
import { DownloadMenu } from 'common/components/DownloadMenu/DownloadMenu';
import classes from './ReactionCard.module.scss';
import { useSelector } from 'react-redux';
import { selectReactionById } from 'store/reactions/reactions.selectors';
import { fileDownloadOptions } from 'common/constants';
import { useMemo } from 'react';
import { typographyClasses } from 'common/styling';

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
        order={3}
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

  const copyToClipboardOptions: CopyButtonOptions[] = [
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
              to={`/dataset/${datasetId}/reaction/${id}`}
            >
              {reaction.pb_reaction_id}
            </Link>

            <CopyButton options={copyToClipboardOptions} />
          </Flex>

          <DescriptorsList
            title="Provenance"
            items={reaction.summary.provenance}
          />
          <DescriptorsList
            title="Summary"
            items={reaction.summary.summary}
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
    </Paper>
  );
}
