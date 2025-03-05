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
import type { TemplateCreator, Template } from './templates.types.ts';
// import type { CurrentPage, Pages } from 'common/types';

const { createAsyncAction } = createActionFactory('templates');

export const getTemplateActions = createAsyncAction<number, Template>('get');

export const createNewTemplateActions = createAsyncAction<TemplateCreator, Template>('create');

// export const addUpdateReactionFieldActions = createAsyncAction<
//   AddEditReactionFieldPayload,
//   Omit<ReactionWrapper, 'data'>
// >('addUpdateField');

// export const deleteReactionFieldActions = createAsyncAction<UpdateReactionPayload, void>('deleteField');

export const removeReactionActions = createAsyncAction<number, number>('remove_dataset');
