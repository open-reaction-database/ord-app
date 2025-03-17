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
import axios from 'axios';
import type { GetAccessToken } from 'common/types/auth.ts';
import { setPageStatus } from './features/page/page.reducer';
import { configureAppStore } from 'store/configureAppStore.ts';
import { handleApiError } from './utils/handleApiError';

export let getAccessToken: GetAccessToken;

export function setAccessTokenGetter(getAccessTokenParam: GetAccessToken) {
  getAccessToken = getAccessTokenParam;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
});

axiosInstance.interceptors.request.use(async config => {
  try {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error retrieving access token:', error);
  }
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    const store = configureAppStore();
    const { errorCode, errorMessage } = handleApiError(error, store.dispatch);

    store.dispatch(setPageStatus({ status: 'error', errorCode, errorMessage }));

    if (errorCode === 404) {
      store.dispatch(setPageStatus({ status: 'notFound', errorCode, errorMessage }));
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
