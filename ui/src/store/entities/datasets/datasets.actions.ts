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
  CreateDatasetFromFilePayload,
  CreateNewDatasetPayload,
  Dataset,
  DatasetGroup,
  DatasetShareUnsharePayload,
} from './datasets.types.ts';
import type { CurrentPage, Pages } from 'common/types';
import type { RejectValue } from 'store/utils/handleApiError.ts';

const { createAsyncAction, createAction } = createActionFactory('datasets');

export const getDatasetActions = createAsyncAction<number, Dataset, RejectValue>('get');

export const getGroupsInitialDatasetListActions = createAsyncAction<number | null, Pages<Dataset>>('list_initial');

export const getDatasetPageActions = createAsyncAction<Partial<CurrentPage>, Pages<Dataset>>('page');

export const createNewDatasetActions = createAsyncAction<CreateNewDatasetPayload, Dataset>('create_empty');

export const createDatasetFromFileActions = createAsyncAction<CreateDatasetFromFilePayload, Dataset>(
  'create_from_file',
);

export const setDatasetEditOpenedAction = createAction<boolean>('set_edit_opened');

export const updateDatasetActions = createAsyncAction<Pick<Dataset, 'id' | 'name' | 'description'>, Dataset>('update');

export const removeDatasetActions = createAsyncAction<number>('remove_dataset');

export const getDatasetGroupsActions = createAsyncAction<number, Array<DatasetGroup>>('get_groups');

export const clearDatasetGroupsListAction = createAction('clear_groups_list');

export const shareDatasetWithGroupActions = createAsyncAction<DatasetShareUnsharePayload, void>('share_dataset');

export const unshareDatasetWithGroupActions = createAsyncAction<DatasetShareUnsharePayload, number>('unshare_dataset');
