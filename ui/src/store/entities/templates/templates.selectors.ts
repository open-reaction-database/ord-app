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
import { createSelectorFactory } from 'store/utils/createSelectorFactory.ts';
import { createSelector } from '@reduxjs/toolkit';
import type { AppState } from 'store/configureAppStore.ts';
// import { selectOrderedInputs } from 'store/entities/reactions/reactions.selectors.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';

const { buildSelector } = createSelectorFactory(state => state.entities.templates);

export const selectTemplates = buildSelector(state => state.templatesById);

export const selectTemplatesOrder = buildSelector(state => state.templatesOrder);

export const selectTemplateById = (id: number) => buildSelector(state => state.templatesById[id]);

export const selectTemplateId = (_state: unknown, id: number) => id;

export const selectTemplatePartByPath =
  (templateId: number, pathComponents: ReactionPathComponents) => (state: AppState) => {
    const reaction = selectTemplateById(templateId)(state);
    if (!reaction) {
      return null;
    }
    try {
      // If the path is incorrect we will get an error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return pathComponents.reduce((reactionPart: any, key) => {
        return reactionPart[key];
      }, reaction?.data);
    } catch (e) {
      console.info(pathComponents, e);
      return null;
    }
  };

export const selectOrderedInputsTemplate = createSelector([selectTemplates, selectTemplateId], (templates, id) => {
  const inputsMap = templates[id]?.data.inputs || {};
  return Object.values(inputsMap).sort((a, b) => {
    const aOrder = a.additionOrder ?? Infinity;
    const bOrder = b.additionOrder ?? Infinity;
    return aOrder === bOrder ? a.name.localeCompare(b.name) : aOrder - bOrder;
  });
});

export const selectOrderedInputsTemplateWrapper = (id: number) => (state: AppState) =>
  selectOrderedInputsTemplate(state, id);
