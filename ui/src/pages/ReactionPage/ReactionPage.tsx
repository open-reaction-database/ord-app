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
import { Component, Fragment } from 'react';
import { getReaction } from 'store/entities/reactions/reactions.thunks.ts';
import { ReactionHeader } from 'features/reactions/ReactionHeader/ReactionHeader.tsx';
import { Badge, Flex, Paper, Tabs, Tooltip } from '@mantine/core';
import { connect } from 'react-redux';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import classes from './reactionPage.module.scss';
import { RequiredAsterisk } from 'common/components/display/RequiredAsterisk/RequiredAsterisk.tsx';
import { Inputs } from 'features/reactions/ReactionView/Inputs/Inputs.tsx';
import { ReactionDetailsSidebar } from 'features/reactions/ReactionDetailsSidebar/ReactionDetailsSidebar.tsx';
import { Notes } from 'features/reactions/ReactionView/Notes/Notes.tsx';
import { PageContainer } from 'common/components/PageContainer/PageContainer.tsx';
import type { Breadcrumbs } from 'common/types/breadcrumbs.ts';
import { selectDatasetById } from 'store/entities/datasets/datasets.selectors.ts';
import { Identifiers } from 'features/reactions/ReactionView/Identifiers/Identifiers.tsx';
import { Outcomes } from 'features/reactions/ReactionView/Outcomes/Outcomes.tsx';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { CheckCircleIcon, CrossCircleIcon } from 'common/icons';
import type { AppState } from 'store/configureAppStore';

export interface Reaction {
  id: number;
  pb_reaction_id: string;
  is_valid: boolean;
}

export interface Dataset {
  id: number;
  name: string;
}

export type ReactionViewSectionProps = Readonly<{
  reactionId: number;
}>;

interface ReactionTab {
  name: string;
  required?: true;
  Component: React.ComponentType<ReactionViewSectionProps>;
}

const createEmptyComponent =
  (name: string): React.FC<ReactionViewSectionProps> =>
  () =>
    name;

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

interface ReactionPageProps {
  readonly reactionId: number;
  readonly datasetId: number;
  readonly getReaction: (params: { datasetId: number; reactionId: number }) => void;
  readonly reaction?: Reaction;
  readonly dataset?: Dataset;
}

class ReactionPage extends Component<ReactionPageProps> {
  componentDidMount() {
    const { datasetId, reactionId, getReaction } = this.props;
    getReaction({ datasetId, reactionId });
  }

  componentDidUpdate(prevProps: ReactionPageProps) {
    const { datasetId, reactionId, getReaction } = this.props;
    if (prevProps.datasetId !== datasetId || prevProps.reactionId !== reactionId) {
      getReaction({ datasetId, reactionId });
    }
  }

  render() {
    const { reaction, dataset, reactionId, datasetId } = this.props;

    const breadcrumbs: Breadcrumbs = [
      { title: 'Datasets', path: '~/' },
      { path: `~/datasets/${datasetId}`, title: dataset?.name ?? datasetId.toString() },
      {
        path: `~/datasets/${datasetId}/reactions/${reactionId}`,
        title: reaction?.pb_reaction_id ?? reactionId.toString(),
      },
    ];

    const CheckIcon = <CheckCircleIcon className={classes.checkIcon} />;
    const CrossIcon = <CrossCircleIcon className={classes.crossIcon} />;
    const contextValue = {
      reactionId,
      pathComponents: [],
    };

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
}

const mapStateToProps = (state: AppState, ownProps: { reactionId: number; datasetId: number }) => ({
  reaction: selectReactionById(ownProps.reactionId)(state),
  dataset: selectDatasetById(ownProps.datasetId)(state),
  reactionId: ownProps.reactionId,
  datasetId: ownProps.datasetId,
});

const mapDispatchToProps = { getReaction };

export default connect(mapStateToProps, mapDispatchToProps)(ReactionPage);
