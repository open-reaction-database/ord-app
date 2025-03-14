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
import { useCallback } from 'react';
import { Link, useParams } from 'wouter';
import { Pagination } from 'common/components/interactions/Pagination/Pagination.tsx';
import { ReactionCard } from './ReactionCard/ReactionCard.tsx';
import { Flex, Paper, Title, Loader } from '@mantine/core';
import { EmptyIcon } from 'common/icons';
import classes from './reactionsList.module.scss';
import { useSelector } from 'react-redux';
import {
  selectReactionsLoading,
  selectReactionsOrder,
  selectReactionsPagination,
  selectReactionById,
} from 'store/entities/reactions/reactions.selectors.ts';
import { getReactionsPage } from 'store/entities/reactions/reactions.thunks.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { CreateReactionMenu } from './CreateReactionMenu/CreateReactionMenu.tsx';
import { Counter } from 'common/components/display/Counter/Counter.tsx';
import { ReactionHeaderActions } from 'features/reactions/ReactionHeader/ReactionHeaderActions/ReactionHeaderActions.tsx';
import { CopyButton, type CopyButtonOptions } from 'common/components/interactions/CopyButton/CopyButton.tsx';

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
    </>
  );
}

export function ReactionList() {
  const dispatch = useAppDispatch();
  const reactionsIds = useSelector(selectReactionsOrder);
  const pagination = useSelector(selectReactionsPagination);
  const isLoading = useSelector(selectReactionsLoading);

  const hasReactions = reactionsIds.length > 0;

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(getReactionsPage({ page }));
    },
    [dispatch],
  );

  const handleRowsPerPageChange = useCallback(
    (size: number) => {
      dispatch(getReactionsPage({ page: 1, size }));
    },
    [dispatch],
  );

  return (
    <>
      <Paper
        radius="sm"
        p="lg"
      >
        <Flex justify="space-between">
          <Flex
            align="center"
            gap="sm"
          >
            <Title order={2}>Dataset Reactions</Title>
            {isLoading ? <Loader size="sm" /> : <Counter amount={pagination.total} />}
          </Flex>
          <CreateReactionMenu />
        </Flex>
      </Paper>

      {isLoading ? (
        <Flex
          justify="center"
          align="center"
          className={classes.loaderContainer}
        >
          <Loader size="lg" />
        </Flex>
      ) : !hasReactions ? (
        <Flex
          align="center"
          justify="center"
        >
          <Flex
            direction="column"
            align="center"
            gap="sm"
          >
            <EmptyIcon />
            <div className={classes.emptyText}>There are no reactions in the dataset yet</div>
          </Flex>
        </Flex>
      ) : (
        <>
          {reactionsIds.map((id, index) => (
            <ReactionCard
              key={id}
              id={id}
              actions={<ReactionHeaderActions reactionId={id} />}
              title={
                <ReactionTitle
                  index={(pagination.page - 1) * pagination.size + index + 1}
                  id={id}
                />
              }
            />
          ))}
          <Pagination
            currentPage={pagination.page}
            onPageChange={handlePageChange}
            rowsPerPage={pagination.size}
            onRowsPerPageChange={handleRowsPerPageChange}
            totalPages={pagination.pages}
          />
        </>
      )}
    </>
  );
}
