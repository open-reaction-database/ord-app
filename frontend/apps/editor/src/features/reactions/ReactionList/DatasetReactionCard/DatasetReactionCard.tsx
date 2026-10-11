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
import {
  ReactionProvider,
  useReactionSnapshot,
  type ReactionSlots,
} from '@open-reaction-database/ui/reaction';
import { useReduxReactionSource } from 'features/reactions/useReduxReactionSource.ts';
import { DatasetReactionValueLabel } from 'features/reactions/ReactionInteractions/ReactionValueLabel/DatasetReactionValueLable.tsx';
import { ReactionViewButton } from 'features/reactions/ReactionInteractions/ReactionViewDeleteButtons/ReactionViewButton.tsx';
import {
  CopyButton,
  type CopyButtonOptions,
} from 'common/components/interactions/CopyButton/CopyButton.tsx';
import { Flex, Tooltip } from '@mantine/core';
import { AlertCircleIcon } from 'common/icons/index.ts';
import classes from '../reactionsList.module.scss';
import { useRef } from 'react';
import { typographyClasses } from '@open-reaction-database/ui/theme';
import clsx from 'clsx';

interface ReactionTitleProps {
  index: number;
  id: number;
}

function ReactionTitle({ index, id }: Readonly<ReactionTitleProps>) {
  const { datasetId: rawDatasetId } = useParams<{ datasetId: string }>();
  const datasetId = Number.parseInt(rawDatasetId);
  const snapshot = useReactionSnapshot();
  const pbReactionId = snapshot?.pb_reaction_id ?? '';
  const copyToClipboardOptions: Array<CopyButtonOptions> = [
    {
      label: 'Copy Reaction Link',
      value: `${globalThis.location.href}/reactions/${id}`,
    },
    { label: 'Copy Reaction ID', value: pbReactionId },
  ];
  const linkToPage = `~/datasets/${datasetId}/reactions/${id}`;

  return (
    <Flex
      align="center"
      gap="xs"
      className={clsx(classes.titleWrapper, typographyClasses.oneLineTextWrapper)}
    >
      <span className={classes.index}>{index}.</span>
      <Tooltip label={pbReactionId}>
        <Link
          className={clsx(classes.link, typographyClasses.oneLineText)}
          to={linkToPage}
        >
          {pbReactionId}
        </Link>
      </Tooltip>
      <CopyButton options={copyToClipboardOptions} />
      {!snapshot?.is_valid && (
        <Flex
          align="center"
          gap="4px"
          className={classes.invalidReactionContainer}
        >
          <AlertCircleIcon />
          <span>Invalid reaction</span>
        </Flex>
      )}
    </Flex>
  );
}

interface DatasetReactionCardProps {
  reactionId: number;
  index: number;
}

// The card never renders slots; ReactionSlots requires them, so it gets the view-only set.
const CARD_SLOTS: ReactionSlots = {
  ViewDeleteButtons: ReactionViewButton,
  ValueLabel: DatasetReactionValueLabel,
  ViewOnlyLabel: DatasetReactionValueLabel,
};

export function DatasetReactionCard({
  reactionId,
  index,
}: Readonly<DatasetReactionCardProps>) {
  const source = useReduxReactionSource(reactionId);
  // The card only displays the reaction; its edit actions live in ReactionHeaderActions.
  return (
    <ReactionProvider
      reactionId={reactionId}
      source={source}
      slots={CARD_SLOTS}
    >
      <DatasetReactionCardBody
        reactionId={reactionId}
        index={index}
      />
    </ReactionProvider>
  );
}

function DatasetReactionCardBody({
  reactionId,
  index,
}: Readonly<DatasetReactionCardProps>) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const isValid = useReactionSnapshot()?.is_valid ?? false;
  return (
    <ReactionCard
      previewRef={previewRef}
      isInvalid={!isValid}
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
