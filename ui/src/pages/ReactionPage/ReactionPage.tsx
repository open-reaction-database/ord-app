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
import classes from './reactionPage.module.scss';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { useEffect, useMemo, useState } from 'react';
import type { Breadcrumbs } from 'common/types/breadcrumbs.ts';
import { getReaction } from 'store/entities/reactions/reactions.thunks.ts';
import { ReactionHeader } from 'features/reactions/ReactionHeader/ReactionHeader.tsx';
import { type SegmentedControlItem, Flex, Paper, SegmentedControl } from '@mantine/core';
import { useSelector } from 'react-redux';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { ReactionDetailsSidebar } from 'features/reactions/ReactionDetailsSidebar/ReactionDetailsSidebar.tsx';
import { PageContainer } from 'common/components/PageContainer/PageContainer.tsx';
import { selectDatasetById } from 'store/entities/datasets/datasets.selectors.ts';
import { NotFoundPage } from 'pages/NotFound/NotFoundPage';
import { selectErrorPage } from 'store/features/errorPage/errorPage.selectors.ts';
import { resetErrorPageAction } from 'store/features/errorPage/errorPage.actions.ts';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import { ReactionEditDeleteButtons } from 'features/reactions/ReactionInteractions/ReactionViewDeleteButtons/ReactionEditDeleteButtons.tsx';
import type { ReactionsContext } from 'features/reactions/reactions.types.ts';
import { ReactionViewButton } from 'features/reactions/ReactionInteractions/ReactionViewDeleteButtons/ReactionViewButton.tsx';
import { DatasetReactionValueLabel } from 'features/reactions/ReactionInteractions/ReactionValueLabel/DatasetReactionValueLable.tsx';
import { selectCanDatasetBeEdited } from '../../store/features/canDatasetBeEdited/canDatasetBeEdited.selectors.ts';
import { colorToCssVariable } from 'common/styling/colors.ts';
import { ReactionContent } from 'features/reactions/ReactionEntities/ReactionTabs/ReactionContent.tsx';

const VIEW_MODE_OPTIONS: Array<SegmentedControlItem> = [
  { label: 'Tabs', value: 'tabs' },
  { label: 'List', value: 'list' },
];

interface ReactionPageProps {
  reactionId: number;
  datasetId: number;
}

export function ReactionPage({ reactionId, datasetId }: Readonly<ReactionPageProps>) {
  const dispatch = useAppDispatch();
  const error = useSelector(selectErrorPage);
  const reaction = useSelector(selectReactionById(reactionId));
  const dataset = useSelector(selectDatasetById(datasetId));
  const canDatasetBeEdited = useSelector(selectCanDatasetBeEdited);
  const isViewOnly = !canDatasetBeEdited;
  const [viewMode, setViewMode] = useState<'tabs' | 'list'>('tabs');
  const breadcrumbs = useMemo((): Breadcrumbs => {
    return [
      { title: 'Datasets', path: '~/' },
      { path: `~/datasets/${datasetId}`, title: dataset?.name ?? datasetId.toString() },
      {
        path: `~/datasets/${datasetId}/reactions/${reactionId}`,
        title: reaction?.pb_reaction_id ?? reactionId.toString(),
      },
    ];
  }, [reactionId, datasetId, dataset?.name, reaction?.pb_reaction_id]);

  useEffect(() => {
    dispatch(getReaction({ datasetId, reactionId }));
  }, [dispatch, datasetId, reactionId]);

  const reactionContextValue = useMemo(
    (): ReactionsContext => ({
      reactionId,
      isTemplate: false,
      isViewOnly,
      ViewDeleteButtonsComponent: isViewOnly ? ReactionViewButton : ReactionEditDeleteButtons,
      ValueLabelComponent: DatasetReactionValueLabel,
      ViewOnlyLabelComponent: DatasetReactionValueLabel,
    }),
    [reactionId, isViewOnly],
  );

  useEffect(
    () => () => {
      dispatch(resetErrorPageAction());
    },
    [dispatch],
  );

  if (error) {
    return <NotFoundPage rejectValue={error} />;
  }

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <reactionContext.Provider value={reactionContextValue}>
        {reaction && (
          <Flex
            direction="column"
            gap="sm"
          >
            <ReactionHeader
              datasetId={datasetId}
              reactionId={reactionId}
            />
            <Paper className={classes.tableContainer}>
              <SegmentedControl
                value={viewMode}
                className={classes.controlBlock}
                color={colorToCssVariable['blue']}
                onChange={value => setViewMode(value as 'tabs' | 'list')}
                data={VIEW_MODE_OPTIONS}
              />
            </Paper>
            <Paper
              radius="md"
              p="lg"
            >
              <ReactionContent
                reactionId={reactionId}
                viewMode={viewMode}
              />
            </Paper>
            <ReactionDetailsSidebar reactionId={reactionId} />
          </Flex>
        )}
      </reactionContext.Provider>
    </PageContainer>
  );
}
