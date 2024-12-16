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
import { Paper, Title } from '@mantine/core';
import { ReactionList } from './ReactionList/ReactionList';
import { DataField } from '../../../common/components/DataField/DataField';
import { UserField } from '../../../common/components/UserField/UserField';
import { formatDate } from '../../../common/utils';
import { generateMockReactions } from '../../../common/mocks/generateMockReactions';
import classes from './DatasetPage.module.scss';

const mockData = generateMockReactions(200);

export function DatasetPage() {
  return (
    <div className={classes.container}>
      <Paper
        radius="sm"
        p="lg"
      >
        <div className={classes.datasetInfo}>
          <DataField label="Group">Group 1</DataField>
          <DataField label="Dataset Owner">
            <UserField username="John Doe" />
          </DataField>
          <DataField label="Dataset ID">123</DataField>
          <DataField label="Last Modified">{formatDate(1122334455)}</DataField>
        </div>
        <Title
          className={classes.title}
          order={1}
        >
          750 AstraZeneca ELN Dataset Lorem ipsum dolor sit amet, consectetur
        </Title>
        <div>
          This dataset includes 750 Buchwald-Hartwig reactions generated from AstraZeneca. CML filenames:
          pftaps19950606_wk23.xml,pftaps19950613_wk24.xml,pftaps199506. Long Text Description for clear example how it
          could be. This dataset includes 750 Buchwald-Hartwig reactions generated from AstraZeneca. Long Text
          Description for clear example how it could be.
        </div>
      </Paper>

      <Paper
        className={classes.titleContainer}
        radius="sm"
        p="lg"
      >
        <Title order={2}>Dataset Reactions</Title>
        <span className={classes.counter}>{mockData.length}</span>
      </Paper>

      <ReactionList reactions={mockData} />
    </div>
  );
}
