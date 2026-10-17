/*
 * Copyright 2026 Open Reaction Database Project Authors
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
import { Redirect, Route, Switch, useSearchParams } from 'wouter';
import { AboutPage } from '#pages/AboutPage.tsx';
import { AskPage } from '#pages/AskPage.tsx';
import { DatasetPage } from '#pages/DatasetPage.tsx';
import { DatasetsPage } from '#pages/DatasetsPage.tsx';
import { HomePage } from '#pages/HomePage.tsx';
import { NotFoundPage } from '#pages/NotFoundPage.tsx';
import { ReactionPage } from '#pages/ReactionPage.tsx';
import { ReactionSetPage } from '#pages/ReactionSetPage.tsx';
import { SearchPage } from '#pages/SearchPage.tsx';
import { routeParam } from '#routeParams.ts';

/** ord-interface's /selected-set?reaction_id=…, as the viewer's /reactions?id=…. */
function SelectedSetRedirect() {
  const [searchParams] = useSearchParams();
  const ids = new URLSearchParams(
    searchParams.getAll('reaction_id').map(reactionId => ['id', reactionId]),
  ).toString();
  return (
    <Redirect
      to={ids ? `/reactions?${ids}` : '/reactions'}
      replace
    />
  );
}

/** The viewer's pages, and redirects from ord-interface's paths to theirs. */
export function ViewerRoutes() {
  return (
    <Switch>
      <Route
        path="/"
        component={HomePage}
      />
      <Route
        path="/datasets"
        component={DatasetsPage}
      />
      <Route path="/datasets/:datasetId">
        {({ datasetId }) => <DatasetPage datasetId={routeParam(datasetId)} />}
      </Route>
      <Route path="/reactions/:reactionId">
        {({ reactionId }) => <ReactionPage reactionId={routeParam(reactionId)} />}
      </Route>
      <Route
        path="/reactions"
        component={ReactionSetPage}
      />
      <Route
        path="/search"
        component={SearchPage}
      />
      <Route
        path="/ask"
        component={AskPage}
      />
      <Route
        path="/about"
        component={AboutPage}
      />
      <Route path="/browse">
        <Redirect
          to="/datasets"
          replace
        />
      </Route>
      <Route path="/dataset/:datasetId">
        {({ datasetId }) => (
          <Redirect
            to={`/datasets/${encodeURIComponent(routeParam(datasetId))}`}
            replace
          />
        )}
      </Route>
      <Route path="/id/:reactionId">
        {({ reactionId }) => (
          <Redirect
            to={`/reactions/${encodeURIComponent(routeParam(reactionId))}`}
            replace
          />
        )}
      </Route>
      <Route
        path="/selected-set"
        component={SelectedSetRedirect}
      />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
