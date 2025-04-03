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
import { createReducer } from '@reduxjs/toolkit';
import { importTemplateFromFileActions } from '../../entities/templates/templates.actions.ts';

export const templateFromFileErrorReducer = createReducer<string | null>(null, builder => {
  builder.addCase(importTemplateFromFileActions.failure, (_, action) => action.payload);
  builder.addCase(importTemplateFromFileActions.request, () => null);
});
