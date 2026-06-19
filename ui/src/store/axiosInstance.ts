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

export let getAccessToken: GetAccessToken;

export function setAccessTokenGetter(getAccessTokenParam: GetAccessToken) {
  getAccessToken = getAccessTokenParam;
}

// Called when the backend rejects a request with 403 Forbidden — the UI's cue that the user's
// permissions may have changed (role downgraded to viewer, removed from a group) so it should
// refresh and re-gate. Wired up by the app once the store is available; a no-op until then. (#617)
let onPermissionDenied: (() => void) | undefined;

export function setPermissionDeniedHandler(handler: () => void) {
  onPermissionDenied = handler;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
});

axiosInstance.interceptors.request.use(async config => {
  config.headers.Authorization = `Bearer ${await getAccessToken()}`;
  return config;
});

// Exported for unit testing; registered as the response error interceptor below. A 403 means the
// user is authenticated but no longer authorized for the action, so trigger a permission refresh.
// (401 is an authentication failure handled by the Auth0 token-refresh/redirect path, not here.)
export async function handleResponseError(error: unknown): Promise<never> {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    onPermissionDenied?.();
  }
  return Promise.reject(error);
}

axiosInstance.interceptors.response.use(response => response, handleResponseError);

export default axiosInstance;
