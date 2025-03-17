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
import type {
  AddEditReactionFieldPayload,
  ImportReactionFromFilePayload,
  ReactionWrapper,
  UpdateReactionPayload,
} from './reactions.types.ts';
import type { CurrentPage, Pages } from 'common/types';
import type { RejectValue } from 'store/utils/handleApiError.ts';

const { createAsyncAction } = createActionFactory('reactions');

export const getReactionsListActions = createAsyncAction<number, Pages<ReactionWrapper>, RejectValue>('get_list');

export const getReactionPageActions = createAsyncAction<Partial<CurrentPage>, Pages<ReactionWrapper>>('get_page');

export const getReactionActions = createAsyncAction<
  { datasetId: number; reactionId: number },
  ReactionWrapper,
  RejectValue
>('get');

export const createEmptyReactionActions = createAsyncAction<void, ReactionWrapper>('create_empty');

export const importReactionFromFileActions = createAsyncAction<ImportReactionFromFilePayload, ReactionWrapper>(
  'import_from_file',
);

export const addUpdateReactionFieldActions = createAsyncAction<
  AddEditReactionFieldPayload,
  Omit<ReactionWrapper, 'data'>
>('addUpdateField');

export const searchReactionActions = createAsyncAction<string, ReactionWrapper>('search');

export const deleteReactionFieldActions = createAsyncAction<UpdateReactionPayload, void>('deleteField');

export const removeReactionActions = createAsyncAction<number, number>('remove_dataset');
