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
import { connect } from 'react-redux';
import React from 'react';
import { Flex, Loader } from '@mantine/core';
import { selectDatasetById } from 'store/entities/datasets/datasets.selectors.ts';
import { ReactionList } from 'features/reactions/ReactionList/ReactionList.tsx';
import { DatasetHeader } from 'features/datasets/DatasetHeader/DatasetHeader.tsx';
import type { Breadcrumbs } from 'common/types/breadcrumbs.ts';
import { PageContainer } from 'common/components/PageContainer/PageContainer.tsx';
import classes from './dataset.page.module.scss';
import { getDataset } from 'store/entities/datasets/datasets.thunks.ts';
import { getReactionsList } from 'store/entities/reactions/reactions.thunks.ts';
import type { Dataset } from 'store/entities/datasets/datasets.types';
import type { AppState } from 'store/configureAppStore';

interface DatasetPageProps {
  readonly datasetId: string;
  readonly dataset?: Dataset;
  readonly getDataset: (id: number) => void;
  readonly getReactionsList: (id: number) => void;
}

export class DatasetPage extends React.Component<DatasetPageProps> {
  private id: number;

  constructor(props: DatasetPageProps) {
    super(props);
    this.id = parseInt(props.datasetId, 10);
  }

  componentDidMount() {
    const { getDataset, getReactionsList } = this.props;
    getDataset(this.id);
    getReactionsList(this.id);
  }

  getBreadcrumbs(): Breadcrumbs {
    const { dataset } = this.props;
    return [
      { title: 'Datasets', path: '~/' },
      { path: `~/datasets/${this.id}`, title: dataset?.name ?? `${this.id}` },
    ];
  }

  render() {
    const { dataset } = this.props;
    const breadcrumbs = this.getBreadcrumbs();

    return (
      <PageContainer breadcrumbs={breadcrumbs}>
        {!dataset ? (
          <Flex
            justify="center"
            align="center"
          >
            <Loader size="xl" />
          </Flex>
        ) : (
          <div className={classes.container}>
            <DatasetHeader dataset={dataset} />
            <ReactionList />
          </div>
        )}
      </PageContainer>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: { datasetId: string }) => {
  const id = parseInt(ownProps.datasetId, 10);
  return {
    dataset: selectDatasetById(id)(state),
    datasetId: ownProps.datasetId,
  };
};

export const DatasetPageClass = connect(mapStateToProps, {
  getDataset,
  getReactionsList,
})(DatasetPage);
