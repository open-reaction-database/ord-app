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
import { useParams } from 'wouter';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { type FC, Fragment, useEffect, useMemo } from 'react';
import { getReaction } from 'store/entities/reactions/reactions.thunks.ts';
import { ReactionHeader } from 'features/reactions/ReactionHeader/ReactionHeader.tsx';
import { Badge, Flex, Paper, Tabs, Tooltip } from '@mantine/core';
import { useSelector } from 'react-redux';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import classes from './reactionPage.module.scss';
import { RequiredAsterisk } from 'common/components/display/RequiredAsterisk/RequiredAsterisk.tsx';
import { Inputs } from 'features/reactions/ReactionView/Inputs/Inputs.tsx';
import type { ReactionViewSectionProps } from 'features/reactions/ReactionView/reactionView.types.ts';
import { ReactionDetailsSidebar } from 'features/reactions/ReactionDetailsSidebar/ReactionDetailsSidebar.tsx';
import { Notes } from 'features/reactions/ReactionView/Notes/Notes.tsx';
import { PageContainer } from 'common/components/PageContainer/PageContainer.tsx';
import type { Breadcrumbs } from 'common/types/breadcrumbs.ts';
import { selectDatasetById } from 'store/entities/datasets/datasets.selectors.ts';
import { Identifiers } from 'features/reactions/ReactionView/Identifiers/Identifiers.tsx';
import { Outcomes } from 'features/reactions/ReactionView/Outcomes/Outcomes.tsx';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { CheckCircleIcon, CrossCircleIcon } from 'common/icons';

interface ReactionTab {
  name: string;
  required?: true;
  Component: FC<ReactionViewSectionProps>;
}

const createEmptyComponent = (name: string) => () => name;

const tabs: Array<ReactionTab> = [
  { name: 'inputs', required: true, Component: Inputs },
  { name: 'outcomes', required: true, Component: Outcomes },
  { name: 'conditions', Component: createEmptyComponent('conditions') },
  { name: 'identifiers', Component: Identifiers },
  { name: 'setup', Component: createEmptyComponent('setup') },
  { name: 'notes', Component: Notes },
  { name: 'observations', Component: createEmptyComponent('observations') },
  { name: 'workups', Component: createEmptyComponent('workups') },
  { name: 'provenance', required: true, Component: createEmptyComponent('provenance') },
];

export function ReactionPage() {
  const dispatch = useAppDispatch();
  const { reactionId: rawReactionId, datasetId: rawDatasetId } = useParams<{ reactionId: string; datasetId: string }>();
  const reactionId = parseInt(rawReactionId);
  const datasetId = parseInt(rawDatasetId);
  const reaction = useSelector(selectReactionById(reactionId));
  const dataset = useSelector(selectDatasetById(datasetId));

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

  const contextValue = useMemo(
    () => ({
      reactionId,
      pathComponents: [],
    }),
    [reactionId],
  );
  const CheckIcon = <CheckCircleIcon className={classes.checkIcon} />;
  const CrossIcon = <CrossCircleIcon className={classes.crossIcon} />;

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <reactionEntityContext.Provider value={contextValue}>
        {reaction && (
          <Flex
            direction="column"
            gap="sm"
          >
            <Badge
              variant="outline"
              size="lg"
              radius="md"
              leftSection={reaction.is_valid ? CheckIcon : CrossIcon}
              className={classes.validationBadge}
            >
              {reaction.is_valid ? 'Reaction is Valid' : 'Reaction is Not Valid'}
            </Badge>
            <ReactionHeader
              datasetId={datasetId}
              reactionId={reactionId}
            />
            <Paper
              radius="md"
              p="lg"
            >
              <Tabs
                defaultValue={tabs[0].name}
                classNames={{ tab: classes.tabTitle, panel: classes.panel }}
              >
                <Tabs.List>
                  {tabs.map(({ name, required }) => (
                    <Fragment key={name}>
                      {required ? (
                        <Tooltip label="Mandatory section">
                          <Tabs.Tab value={name}>
                            {name}
                            <RequiredAsterisk />
                          </Tabs.Tab>
                        </Tooltip>
                      ) : (
                        <Tabs.Tab value={name}>{name}</Tabs.Tab>
                      )}
                    </Fragment>
                  ))}
                </Tabs.List>
                {tabs.map(({ name, Component }) => (
                  <Tabs.Panel
                    key={name}
                    value={name}
                  >
                    <Component reactionId={reactionId} />
                  </Tabs.Panel>
                ))}
              </Tabs>
            </Paper>
            <ReactionDetailsSidebar reactionId={reactionId} />
          </Flex>
        )}
      </reactionEntityContext.Provider>
    </PageContainer>
  );
}
