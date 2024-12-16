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
import { createAction } from '@reduxjs/toolkit';
import type { AsyncAction, CreateActionFactory } from 'common/types';

export function createAsyncAction<RequestPayload, SuccessPayload, FailurePayload = Error>(
  type: string,
): AsyncAction<RequestPayload, SuccessPayload, FailurePayload> {
  return {
    request: createAction<RequestPayload>(`${type}/request`),
    success: createAction<SuccessPayload>(`${type}/success`),
    failure: createAction<FailurePayload>(`${type}/failure`),
  };
}

export function createActionFactory(prefix: string): CreateActionFactory {
  return {
    createAction: (type: string) => createAction(`${prefix}/${type}`),
    createAsyncAction: (type: string) => createAsyncAction(`${prefix}/${type}`),
  };
}
