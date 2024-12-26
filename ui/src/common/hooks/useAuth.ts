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
import axiosInstance, { setAccessTokenGetter } from '../config/axiosConfig.ts';
import { useAppDispatch } from '../../store/useAppDispatch.ts';
import { setActiveUser } from '../../store/users/users.actions.ts';
import type { Self } from '../../store/users/users.types.ts';

export function useAuth() {
  const auth0 = useAuth0();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, loginWithRedirect, user, getAccessTokenSilently, getIdTokenClaims } = auth0;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  useEffect(() => {
    if (isAuthenticated) {
      setAccessTokenGetter(getAccessTokenSilently);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    const provisionUser = async () => {
      const idToken = (await getIdTokenClaims())?.__raw;
      const accessToken = await getAccessTokenSilently();

      axiosInstance.post('/auth/jit-provisioning', { access_token: accessToken, id_token: idToken });
    };

    if (user) {
      dispatch(setActiveUser(user as Self));

      provisionUser();
    }
  }, [dispatch, user, getAccessTokenSilently, getIdTokenClaims]);

  return isLoading;
}
