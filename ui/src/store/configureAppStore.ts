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
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer';
import { isDev } from 'common/constants';
import { previewsWorkerMiddleware } from 'store/features/previewsWorker/previewsWorkerMiddleware.ts';
import { enumerationWorkerMiddleware } from 'store/features/enumerationWorker/enumerationWorkerMiddleware.ts';
import { importTemplateFromFileActions } from './entities/templates/templates.actions.ts';
import { createDatasetFromFileActions } from './entities/datasets/datasets.actions.ts';
import { importReactionFromFileActions } from './entities/reactions/reactions.actions.ts';

export function configureAppStore() {
  return configureStore({
    reducer: rootReducer,
    devTools: isDev,
    // For some reason redux usage example not working correctly with types here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware: (getDefaultMiddleware): any =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            importTemplateFromFileActions.request.type,
            createDatasetFromFileActions.request.type,
            importReactionFromFileActions.request.type,
          ],
        },
      }).concat([previewsWorkerMiddleware, enumerationWorkerMiddleware]),
  });
}

export const store = configureAppStore();
export type AppState = ReturnType<typeof store.getState>;
