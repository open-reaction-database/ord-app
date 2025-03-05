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
import { createNewTemplateActions, getTemplateActions } from './templates.actions.ts';
import type { Template } from './templates.types.ts';
import { createThunk, createThunkWithExplicitResult } from 'store/utils';
import axiosInstance from 'store/axiosInstance.ts';
// import type { Pages } from 'common/types';
import { reactionToOrdReaction } from '../reactions/reactions.converters.ts';
import { navigate } from 'wouter/use-browser-location';
import { ord } from 'ord-schema-protobufjs';
import { Buffer } from 'buffer';
import { selectReactionById } from '../reactions/reactions.selectors.ts';

export const getTemplate = createThunk(getTemplateActions, async (_d, _g, templateId) => {
  const template = (await axiosInstance.get<Template>(`/templates/${templateId}`)).data;
  return getTemplateActions.success(template);
});

export const createTemplate = createThunkWithExplicitResult(
  createNewTemplateActions,
  async (dispatch, getState, { ...templateLoad }) => {
    const reaction = selectReactionById(templateLoad.reactionId)(getState());
    const ordReaction = reactionToOrdReaction(reaction.data);
    const binpb = Buffer.from(ord.Reaction.encode(ordReaction).finish()).toString('base64');
    const payload = {
      name: templateLoad.name,
      binpb: binpb,
      variables: JSON.stringify('[]'),
    };
    const template = (await axiosInstance.post<Template>(`/templates`, payload)).data;
    // console.log('template', template);
    dispatch(createNewTemplateActions.success(template));
    navigate(`/templates/${template.id}`);
  },
);

// export const updateTemplate = createThunk(updateTemplateActions, async (_d, _g, { id, ...payload }) => {
//   const updateTemplate = (await axiosInstance.patch<Template>(`templates/${id}`, payload)).data;
//   return updateDatasetActions.success(updateTemplate);
// });

// export const removeTemplate = createThunkWithExplicitResult(removeTemplateActions, async (dispatch, _g, templateId) => {
//   await axiosInstance.delete(`/templates/${templateId}`);
//   dispatch(removeTemplateActions.success());
//   navigate(`/`);
// });
