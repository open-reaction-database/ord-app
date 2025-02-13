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
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';

const { createAction } = createActionFactory('reactionForm');

export const setReactionPathComponentsList = createAction<Array<ReactionPathComponents>>('set_list');

export const addReactionPathComponentToList = createAction<ReactionPathComponents>('add_to_list');

export const popReactionPathComponents = createAction<void>('pop_from_list');

export const clearReactionPathComponentsList = createAction<void>('clear_list');

export const sliceReactionPathComponentsList = createAction<number>('slice_list');
