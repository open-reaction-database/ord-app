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
import type { createAction, PayloadActionCreator } from '@reduxjs/toolkit';

type CreateAction = typeof createAction;

type CreateActionKnownPayload<P = void> = (type: string) => PayloadActionCreator<P>;

export interface AsyncAction<RequestPayload = void, SuccessPayload = void, FailurePayload = Error | null> {
  request: ReturnType<CreateActionKnownPayload<RequestPayload>>;
  success: ReturnType<CreateActionKnownPayload<SuccessPayload>>;
  failure: ReturnType<CreateActionKnownPayload<FailurePayload>>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyAsyncAction = AsyncAction<any, any, any>;

export interface CreateAsyncAction {
  <RequestPayload = void, SuccessPayload = void, FailurePayload = Error | null>(
    type: string,
  ): AsyncAction<RequestPayload, SuccessPayload, FailurePayload>;
}

export interface CreateActionFactory {
  createAction: CreateAction;
  createAsyncAction: CreateAsyncAction;
}
