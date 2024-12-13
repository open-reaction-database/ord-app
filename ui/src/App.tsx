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
import { theme } from './common/styling/theme';
import { DatasetTable } from './components/DatasetTable/DatasetTable';
import { PageContainer } from './common/components/PageContainer/PageContainer';
import { configureAppStore } from './store/configureAppStore.ts';
import { Provider } from 'react-redux';

const store = configureAppStore();

export function App() {
  return (
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <PageContainer>
          <DatasetTable />
        </PageContainer>
      </MantineProvider>
    </Provider>
  );
}
