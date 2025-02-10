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
import { createThunk } from 'store/utils';
import { createUserActions } from './users.actions.ts';
import axiosInstance from 'store/axiosInstance.ts';
import type { User } from './users.types.ts';

export const createUser = createThunk(createUserActions, async (_d, _s, tokens) => {
  const user = (await axiosInstance.post<User>('/auth/jit-provisioning', tokens)).data;
  return createUserActions.success(user);
});
