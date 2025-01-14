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
import { Button, Flex, Paper } from '@mantine/core';
import { Link, useParams } from 'wouter';
import { CopyButton, type CopyButtonOptions } from '../../DatasetHeader/CopyButton/CopyButton';
import { CheckListIcon, ChevronDownIcon, DotsIcon, DownloadIcon } from 'common/icons';
import { DownloadMenu, type DownloadMenuOptions } from '../../DatasetHeader/DownloadMenu/DownloadMenu';
import classes from './ReactionCard.module.scss';
import { downloadFile } from 'common/utils';
import { useSelector } from 'react-redux';
import { selectReactionById } from '../../../../store/reactions/reactions.selectors';

interface ReactionCardProps {
  id: number;
  index: number;
}

const reactionDownloadOptions: DownloadMenuOptions[] = [
  { label: '.pb', format: 'binpb' },
  { label: '.pbtxt', format: 'txtpb' },
];

export function ReactionCard({ id, index }: Readonly<ReactionCardProps>) {
  const { datasetId } = useParams();
  const reaction = useSelector(selectReactionById(id));

  const handleReactionDownload = (format: string) => {
    const url = `/datasets/${datasetId}/reactions/${id}/download?file_format=${format}`;
    downloadFile(url, `Dataset_${datasetId}_Reaction_${id}`);
  };

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
              to={'/Dataset/123/reaction/123'}
            >
              {reaction.name || reaction.id}
            </Link>

            <CopyButton options={copyToClipboardOptions} />
          </Flex>

          <div>
            <span className={classes.summaryTitle}>Provenance Summary: </span>
            <span className={classes.summary}>{reaction.data?.notes?.procedureDetails || 'Generated summary'}</span>
          </div>
        </div>

        <div className={classes.buttonContainer}>
          <Button
            leftSection={<CheckListIcon />}
            variant="white"
          >
            Save as a Template
          </Button>

          <DownloadMenu
            options={reactionDownloadOptions}
            onClick={handleReactionDownload}
            target={
              <Button
                className={classes.target}
                leftSection={<DownloadIcon />}
                rightSection={<ChevronDownIcon />}
                variant="white"
              >
                Download Reaction
              </Button>
            }
          />

          <Button
            leftSection={<DotsIcon />}
            variant="white"
          >
            More
          </Button>
        </div>
      </div>

      <div>Reaction Field</div>
      <div>
        <span className={classes.infoTitle}>Conditions: </span>
        Conidtions &middot;
        <span className={classes.infoTitle}> Analysis: </span>
        Analysis
      </div>
    </Paper>
  );
}
