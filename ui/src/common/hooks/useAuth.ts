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
import { setAccessTokenGetter } from '../config/axiosConfig';
import { useAppDispatch } from 'store/useAppDispatch';
import { setActiveUser } from 'store/users/users.actions';
import type { Self } from 'store/users/users.types';
import { selectIsUserCreated } from 'store/users/users.selectors';
import { useSelector } from 'react-redux';
import { createUser } from 'store/users/users.thunks';

export function useAuth() {
  const auth0 = useAuth0();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, loginWithRedirect, user, getAccessTokenSilently, getIdTokenClaims } = auth0;
  const isUserCreated = useSelector(selectIsUserCreated);

  const isAppLoading = isLoading || !isAuthenticated || !isUserCreated;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: {
          returnTo: window.location.href,
        },
      });
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  useEffect(() => {
    if (isAuthenticated) {
      setAccessTokenGetter(getAccessTokenSilently);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    if (user) {
      dispatch(setActiveUser(user as Self));
    }
  }, [dispatch, user]);

  useEffect(() => {
    const provisionUser = async () => {
      const [idToken, accessToken] = await Promise.all([getIdTokenClaims(), getAccessTokenSilently()]);
      dispatch(createUser({ access_token: accessToken, id_token: idToken?.__raw as string }));
    };

    if (user) {
      provisionUser();

      dispatch(setActiveUser(user as Self));
    }
  }, [dispatch, user, getAccessTokenSilently, getIdTokenClaims]);

  return isAppLoading;
}
