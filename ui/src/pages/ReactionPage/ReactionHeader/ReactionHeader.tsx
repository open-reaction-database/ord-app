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
import { ActionIcon, Button, Flex, Paper, Title } from '@mantine/core';
import { selectReactionById } from 'store/reactions/reactions.selectors';
import { useSelector } from 'react-redux';
import { CopyButton } from 'common/components/CopyButton/CopyButton';
import { CheckListIcon, ChevronDownIcon, DownloadIcon, EditIcon, TrashIcon } from 'common/icons';
import { useMemo } from 'react';
import { DownloadMenu, type DownloadMenuOptions } from 'common/components/DownloadMenu/DownloadMenu';
import { useLocation } from 'wouter';
import { domain } from 'common/constants';

const reactionDownloadOptions: DownloadMenuOptions[] = [
  { label: '.pb', format: 'binpb' },
  { label: '.pbtxt', format: 'txtpb' },
];

interface ReactionHeaderProps {
  datasetId: number;
  reactionId: number;
}

export function ReactionHeader({ datasetId, reactionId }: Readonly<ReactionHeaderProps>) {
  const [location] = useLocation();
  const reaction = useSelector(selectReactionById(reactionId));

  const copyOptions = useMemo(
    () => [
      { label: 'Copy Reaction Link', value: `${domain}${location}` },
      { label: 'Copy Reaction ID', value: reactionId.toString() },
    ],
    [reactionId, location],
  );

  return (
    <Paper
      radius="md"
      p="lg"
    >
      <Flex
        direction="column"
        gap="sm"
      >
        <Flex justify="space-between">
          <Flex
            align="center"
            gap="sm"
          >
            <Title order={2}>{reaction.name}</Title>
            <CopyButton options={copyOptions} />
            <ActionIcon variant="white">
              <EditIcon />
            </ActionIcon>
          </Flex>
          <Flex
            align="center"
            gap="sm"
          >
            <Button
              variant="white"
              color="red"
              leftSection={<TrashIcon />}
            >
              Remove
            </Button>
            <Button
              variant="white"
              leftSection={<CheckListIcon />}
            >
              Save as Template
            </Button>
            <DownloadMenu
              options={reactionDownloadOptions}
              url={`/datasets/${datasetId}/reactions/${reactionId}/download`}
              target={
                <Button
                  leftSection={<DownloadIcon />}
                  rightSection={<ChevronDownIcon />}
                  variant="white"
                >
                  Download Reaction
                </Button>
              }
            />
            <Button>Save</Button>
          </Flex>
        </Flex>
      </Flex>
    </Paper>
  );
}
