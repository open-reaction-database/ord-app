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
import { createActionFactory } from 'store/utils';
import type { AddUpdateRemoveVariablePayload, ImportTemplatePayload, TemplateCreator } from './templates.types.ts';
import type { ReactionTemplate } from 'store/entities/reactions/reactions.types.ts';

const { createAsyncAction } = createActionFactory('templates');

export const getTemplateActions = createAsyncAction<number, ReactionTemplate>('get');

export const getAllTemplatesActions = createAsyncAction<void, Array<ReactionTemplate>>('get_all_templates');

export const createNewTemplateActions = createAsyncAction<TemplateCreator, ReactionTemplate>('create');

export const removeTemplateActions = createAsyncAction<string, string>('remove_template');

export const renameTemplateActions = createAsyncAction<{ templateId: string; name: string }, ReactionTemplate>(
  'rename_template',
);

export const addUpdateVariableActions = createAsyncAction<AddUpdateRemoveVariablePayload, void>('addUpdateVariable');

export const removeVariableActions = createAsyncAction<AddUpdateRemoveVariablePayload, void>('removeVariable');

export const importTemplateFromFileActions = createAsyncAction<ImportTemplatePayload, ReactionTemplate, string>(
  'importFromFile',
);
