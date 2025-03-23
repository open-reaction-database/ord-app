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
import { type Action, type Middleware, type ThunkDispatch, isAnyOf } from '@reduxjs/toolkit';
import type { AppState } from '../../configureAppStore.ts';
import type { EnumerationBatchResult } from '../../entities/enumeration/enumeration.types.ts';
import { enumerateBatchResult } from '../../entities/enumeration/enumeration.thunks.ts';
import { enumerateBatchActions } from '../../entities/enumeration/enumeration.actions.ts';

export const enumerationWorkerMiddleware: Middleware<
  object,
  AppState,
  ThunkDispatch<AppState, never, Action>
> = api => {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = event => {
    const enumerationBatch: EnumerationBatchResult = event.data;

    api.dispatch(enumerateBatchResult(enumerationBatch));
  };

  return next => action => {
    if (typeof action === 'function') {
      return next(action);
    }

    if (isAnyOf(enumerateBatchActions.request)(action)) {
      worker.postMessage(action.payload);
    }

    return next(action);
  };
};
