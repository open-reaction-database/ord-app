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
import { Route, Switch } from 'wouter';
import { DatasetPage } from './DatasetPage/DatasetPage';
import { PageContainer } from 'common/components/PageContainer/PageContainer';
import { ContributePage } from './ContributePage/ContributePage';

export function Routes() {
  return (
    <PageContainer>
      <Switch>
        <Route
          path="/"
          component={ContributePage}
        ></Route>

        <Route
          path="/dataset/:datasetId"
          component={DatasetPage}
        />
      </Switch>
    </PageContainer>
  );
}
