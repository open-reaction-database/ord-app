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
import { DatasetRoute } from './Dataset/Dataset.route.tsx';
import { DatasetsListPage } from 'pages/DatasetsList/DatasetsList.page.tsx';

export function DatasetsListRoute() {
  // The datasets list is fetched by DatasetsListPage on mount (and on group switch), so navigating
  // back to the list always gets a fresh list rather than a stale cached one. (#584)
  return (
    <Switch>
      <Route
        path=":datasetId"
        nest
      >
        <DatasetRoute />
      </Route>
      <Route path="/">
        <DatasetsListPage />
      </Route>
    </Switch>
  );
}
