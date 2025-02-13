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
import { Route, Switch, useParams } from 'wouter';
import { ReactionPage } from 'pages/ReactionPage/ReactionPage.tsx';
import { DatasetPage } from 'pages/Dataset/Dataset.page.tsx';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { useEffect } from 'react';
import { getDataset } from 'store/entities/datasets/datasets.thunks.ts';
import { getReactionsList } from 'store/entities/reactions/reactions.thunks.ts';

export function DatasetRoute() {
  const dispatch = useAppDispatch();
  const { datasetId } = useParams();
  const id = parseInt(datasetId as string);

  useEffect(() => {
    dispatch(getDataset(id));
    dispatch(getReactionsList(id));
  }, [dispatch, id]);

  return (
    <Switch>
      <Route path="/reactions/:reactionId">
        <ReactionPage />
      </Route>
      <Route path="/">
        <DatasetPage />
      </Route>
    </Switch>
  );
}
