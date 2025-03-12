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
import { getTemplateActions, createNewTemplateActions, getAllTemplatesActions } from './templates.actions.ts';
import type { ItemsById } from 'common/types';
import type { TemplateWrapper, Template } from './templates.types.ts';

const getTemplateId = (template: TemplateWrapper) => template.id;

const templatesById = createReducer<ItemsById<TemplateWrapper>>({}, builder => {
  builder.addMatcher(isAnyOf(getTemplateActions.success), (state, action) => ({
    ...state,
    [getTemplateId(action.payload)]: action.payload,
  }));
  builder.addMatcher(isAnyOf(getAllTemplatesActions.success), (state, action) => {
    const allTemplates = action.payload.reduce((acc, template) => {
      acc[getTemplateId(template)] = template;
      return acc;
    }, {} as ItemsById<TemplateWrapper>);
    return {
      ...state,
      ...allTemplates,
    };
  });
});

const templatesOrder = createReducer<Array<Template>>([], builder => {
  builder.addMatcher(isAnyOf(getAllTemplatesActions.success), (state, action) => ({
    ...state,
    templates: action.payload,
  }));
});

const isTemplateCreating = createReducer<boolean>(false, builder => {
  builder.addMatcher(isAnyOf(createNewTemplateActions.request, getTemplateActions.request), () => true);
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

export const templatesReducer = combineReducers({
  templatesById,
  isTemplateCreating,
  templatesOrder,
});
