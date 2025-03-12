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
import { createNewTemplateActions, getTemplateActions, getAllTemplatesActions } from './templates.actions.ts';
import type { Template, TemplateWrapper } from './templates.types.ts';
import { createThunk, createThunkWithExplicitResult } from 'store/utils';
import axiosInstance from 'store/axiosInstance.ts';
import { ordReactionToReaction, reactionToOrdReaction } from '../reactions/reactions.converters.ts';
import { navigate } from 'wouter/use-browser-location';
import { ord } from 'ord-schema-protobufjs';
import { Buffer } from 'buffer';
import { selectReactionById } from '../reactions/reactions.selectors.ts';
import { getReactionPreviews } from '../reactions/reactions.thunks.ts';

const parseTemplate = ({ binpb, molblocks, variables, ...rest }: Template): TemplateWrapper => {
  const parsedProtobuf = ord.Reaction.decode(Buffer.from(binpb, 'base64'));
  const appReaction = ordReactionToReaction(ord.Reaction.toObject(parsedProtobuf));
  const previews = getReactionPreviews(appReaction, molblocks);

  return {
    ...rest,
    variables: variables,
    previews,
    data: appReaction,
  };
};

export const getTemplate = createThunk(getTemplateActions, async (_d, _s, templateId) => {
  const result = await axiosInstance.get<Template>(`/templates/${templateId}`);
  const template = parseTemplate(result.data);
  return getTemplateActions.success(template);
});

export const getAllTemplates = createThunk(getAllTemplatesActions, async (_d, _s) => {
  const result = await axiosInstance.get<Array<Template>>(`/templates`);
  const templates = result.data;
  const parsedTemplates = templates.map(template => parseTemplate(template));
  return getAllTemplatesActions.success(parsedTemplates);
});

export const createTemplate = createThunkWithExplicitResult(
  createNewTemplateActions,
  async (dispatch, getState, templateLoad) => {
    const reaction = selectReactionById(templateLoad.reactionId)(getState());
    const ordReaction = reactionToOrdReaction(reaction.data);
    const binpb = Buffer.from(ord.Reaction.encode(ordReaction).finish()).toString('base64');
    const payload = {
      name: templateLoad.name,
      binpb: binpb,
      variables: JSON.stringify([]),
    };
    const template = (await axiosInstance.post<Template>(`/templates`, payload)).data;
    dispatch(createNewTemplateActions.success(template));
    navigate(`/templates/${template.id}`);
  },
);
