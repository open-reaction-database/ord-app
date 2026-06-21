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
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import {
  setAccessTokenGetter,
  setPermissionDeniedHandler,
} from 'store/axiosInstance.ts';
import { useAppDispatch } from 'store/useAppDispatch';
import { useSelector } from 'react-redux';
import { createUser } from 'store/entities/users/users.thunks';
import { getGroupList } from 'store/entities/groups/groups.thunks';
import { selectSelf } from 'store/entities/users/users.selectors';
import { e2eDevToken, noAuth } from 'common/noAuth.constants.ts';
import type { GetAccessToken } from 'common/types/auth.ts';

export function useAuth() {
  const auth0 = useAuth0();
  const dispatch = useAppDispatch();
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    user,
    getAccessTokenSilently,
    getIdTokenClaims,
  } = auth0;
  const isUserCreated = useSelector(selectSelf);

  const isAppLoading = !isUserCreated;

  useEffect(() => {
    // In the dev/test no-auth bypass we never redirect to Auth0.
    if (noAuth) {
      return;
    }
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: {
          returnTo: globalThis.location.href,
        },
      });
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  useEffect(() => {
    if (noAuth) {
      // The axios interceptor only ever calls this with no args; cast to satisfy Auth0's
      // overloaded getter type (which also has a detailed-response variant).
      setAccessTokenGetter((async () => e2eDevToken) as GetAccessToken);
      return;
    }
    if (isAuthenticated) {
      setAccessTokenGetter(getAccessTokenSilently);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    // When the backend rejects an action with 403 (role downgraded to viewer, removed from a
    // group), refresh the current user's group memberships/roles so permission-gated affordances
    // re-gate without a manual page reload. (#617) The in-flight guard prevents re-entrancy if the
    // refresh request is itself rejected.
    let isRefreshing = false;
    setPermissionDeniedHandler(() => {
      if (isRefreshing) {
        return;
      }
      isRefreshing = true;
      void Promise.resolve(dispatch(getGroupList())).finally(() => {
        isRefreshing = false;
      });
    });
  }, [dispatch]);

  useEffect(() => {
    // Provision the mock user once with the static dev token (requires the backend e2e mode, #664).
    // Kept in its own effect with a [dispatch]-only dep so changing Auth0 function references
    // (unused in this path) can't trigger duplicate provisioning calls.
    if (noAuth) {
      dispatch(createUser({ access_token: e2eDevToken, id_token: e2eDevToken }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (noAuth) {
      return;
    }

    const provisionUser = async () => {
      try {
        const [idToken, accessToken] = await Promise.all([
          getIdTokenClaims(),
          getAccessTokenSilently(),
        ]);
        dispatch(
          createUser({ access_token: accessToken, id_token: idToken?.__raw as string }),
        );
      } catch (_: unknown) {
        loginWithRedirect({
          appState: {
            returnTo: globalThis.location.href,
          },
        });
      }
    };

    if (user) {
      provisionUser();
    }
  }, [dispatch, user, getAccessTokenSilently, getIdTokenClaims, loginWithRedirect]);

  return isAppLoading;
}
