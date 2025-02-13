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
import { useEffect } from 'react';
import { getInitialDatasetsList } from 'store/entities/datasets/datasets.thunks.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'store/features/groups/groups.selectors.ts';

export function DatasetsListRoute() {
  const dispatch = useAppDispatch();
  const activeGroupId = useSelector(selectActiveGroupId);
  useEffect(() => {
    dispatch(getInitialDatasetsList(activeGroupId));
  }, [activeGroupId, dispatch]);

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
