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
import { Auth0Provider } from '@auth0/auth0-react';
import { auth0ClientId, auth0Domain, domain } from '../constants.ts';
import { Provider } from 'react-redux';
import { MantineProvider } from '@mantine/core';
import { theme } from '../common/styling/theme.ts';
import { configureAppStore } from '../store/configureAppStore.ts';
import { AppContent } from './AppContent.tsx';

const store = configureAppStore();

export function AppRoot() {
  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: domain,
        // TODO fill in after BE completes https://developer.auth0.com/resources/guides/spa/react/basic-authentication#integrate-react-with-an-api-server
        // audience: 'http://localhost:8000/api/v1',
      }}
    >
      <Provider store={store}>
        <MantineProvider theme={theme}>
          <AppContent />
        </MantineProvider>
      </Provider>
    </Auth0Provider>
  );
}
