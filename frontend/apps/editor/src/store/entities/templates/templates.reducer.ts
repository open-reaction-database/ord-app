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
import { combineReducers, createReducer, isAnyOf } from '@reduxjs/toolkit';
import {
  getTemplateActions,
  createNewTemplateActions,
  getAllTemplatesActions,
  removeTemplateActions,
  importTemplateFromFileActions,
} from './templates.actions.ts';
import type { ReactionTemplate } from 'store/entities/reactions/reactions.types.ts';

const getTemplateId = (template: ReactionTemplate) => template.id;

const templatesOrder = createReducer<Array<string>>([], builder => {
  builder.addCase(getAllTemplatesActions.success, (_, action) => {
    return action.payload.map(getTemplateId);
  });
  builder.addCase(removeTemplateActions.success, (state, action) => {
    return state.filter(id => id !== action.payload);
  });
  builder.addMatcher(
    isAnyOf(createNewTemplateActions.success, importTemplateFromFileActions.success),
    (state, action) => {
      return [getTemplateId(action.payload), ...state];
    },
  );
});

const isTemplateCreating = createReducer<boolean>(false, builder => {
  builder.addMatcher(
    isAnyOf(createNewTemplateActions.request, getTemplateActions.request),
    () => true,
  );
  builder.addMatcher(
    isAnyOf(
      createNewTemplateActions.success,
      createNewTemplateActions.failure,
      getTemplateActions.success,
      getTemplateActions.failure,
    ),
    () => false,
  );
});

// Whether the template-list fetch has settled. Lets the template page tell "still loading" apart
// from "no such template" so it can show a 404 for a missing id rather than a blank page, without
// flashing the 404 during the initial load. Set on failure too, so a failed fetch still reaches the
// 404 path instead of leaving a permanently blank page. (#496)
const areTemplatesLoaded = createReducer<boolean>(false, builder => {
  builder.addMatcher(
    isAnyOf(getAllTemplatesActions.success, getAllTemplatesActions.failure),
    () => true,
  );
});

export const templatesReducer = combineReducers({
  templatesOrder,
  isTemplateCreating,
  areTemplatesLoaded,
});
