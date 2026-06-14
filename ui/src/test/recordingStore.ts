/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { configureStore, type UnknownAction } from '@reduxjs/toolkit';
import { rootReducer } from 'store/rootReducer.ts';

/**
 * Build a real app store wired with a middleware that records every dispatched action, for
 * thunk tests. `types()` returns the dispatched action types in order, so a test can assert
 * that a thunk fired (or didn't fire) a given follow-up action.
 */
export function makeRecordingStore() {
  const actions: Array<UnknownAction> = [];
  const recorder = () => (next: (action: unknown) => unknown) => (action: unknown) => {
    actions.push(action as UnknownAction);
    return next(action);
  };
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefault => getDefault().concat(recorder),
  });
  return { store, types: () => actions.map(action => action.type) };
}
