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
import { ReactionHeaderActions } from '../../ReactionHeader/ReactionHeaderActions/ReactionHeaderActions.tsx';
import { ReactionCard } from 'common/components/ReactionCard/ReactionCard.tsx';
import { Link, useParams } from 'wouter';
import { useSelector } from 'react-redux';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { CopyButton, type CopyButtonOptions } from 'common/components/interactions/CopyButton/CopyButton.tsx';
import { Flex } from '@mantine/core';
import { AlertCircleIcon } from 'common/icons/index.ts';
import classes from '../reactionsList.module.scss';
import { useRef } from 'react';

interface ReactionTitleProps {
  index: number;
  id: number;
}

function ReactionTitle({ index, id }: Readonly<ReactionTitleProps>) {
  const { datasetId: rawDatasetId } = useParams<{ datasetId: string }>();
  const datasetId = parseInt(rawDatasetId);
  const reaction = useSelector(selectReactionById(id));
  const copyToClipboardOptions: Array<CopyButtonOptions> = [
    {
      label: 'Copy Reaction Link',
      value: `${window.location.href}/reactions/${id}`,
    },
    { label: 'Copy Reaction ID', value: reaction.pb_reaction_id },
  ];
  const linkToPage = `~/datasets/${datasetId}/reactions/${id}`;

  return (
    <>
      <span className={classes.index}>{index}.</span>
      <Link
        className={classes.link}
        to={linkToPage}
      >
        {reaction.pb_reaction_id}
      </Link>
      <CopyButton options={copyToClipboardOptions} />
      {!reaction.is_valid && (
        <Flex
          align="center"
          gap="4px"
          className={classes.invalidReactionContainer}
        >
          <AlertCircleIcon />
          <span>Invalid reaction</span>
        </Flex>
      )}
    </>
  );
}

interface DatasetReactionCardProps {
  reactionId: number;
  index: number;
}

export function DatasetReactionCard({ reactionId, index }: Readonly<DatasetReactionCardProps>) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const reaction = useSelector(selectReactionById(reactionId));
  return (
    <ReactionCard
      key={reactionId}
      id={reactionId}
      previewRef={previewRef}
      isInvalid={!reaction.is_valid}
      actions={
        <ReactionHeaderActions
          reactionId={reactionId}
          previewRef={previewRef}
        />
      }
      title={
        <ReactionTitle
          index={index}
          id={reactionId}
        />
      }
    />
  );
}
