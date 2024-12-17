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
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { Link, Route, Switch } from 'wouter';
import { configureAppStore } from './store/configureAppStore.ts';
import { theme } from './common/styling/theme';
import { DatasetTable } from './pages/DatasetTable/DatasetTable';
import { PageContainer } from './common/components/PageContainer/PageContainer';
import { DatasetPage } from './pages/dataset/DatasetPage/DatasetPage';

const store = configureAppStore();

export function App() {
  return (
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <PageContainer>
          <Switch>
            <Route path="/">
              <DatasetTable />
              <Link to="/dataset/1">Test dataset link</Link>
            </Route>

            <Route
              path="/dataset/:datasetId"
              component={DatasetPage}
            />
          </Switch>
        </PageContainer>
      </MantineProvider>
    </Provider>
  );
}
