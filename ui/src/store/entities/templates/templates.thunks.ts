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
import {
  createNewTemplateActions,
  getTemplateActions,
  getAllTemplatesActions,
  removeTemplateActions,
  renameTemplateActions,
} from './templates.actions.ts';
import type { TemplateResponse } from './templates.types.ts';
import { createThunk, createThunkWithExplicitResult } from 'store/utils';
import axiosInstance from 'store/axiosInstance.ts';
import {
  convertReactionFloatsToDoubles,
  ordReactionToReaction,
  reactionToOrdReaction,
} from '../reactions/reactions.converters.ts';
import { navigate } from 'wouter/use-browser-location';
import { ord } from 'ord-schema-protobufjs';
import { Buffer } from 'buffer';
import { selectReactionById } from '../reactions/reactions.selectors.ts';
import { getReactionPreviews } from '../reactions/reactions.thunks.ts';
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';
import type { ReactionTemplate } from 'store/entities/reactions/reactions.types.ts';

const parseTemplate = ({ id, binpb, molblocks, variables, ...rest }: TemplateResponse): ReactionTemplate => {
  const parsedProtobuf = ord.Reaction.decode(Buffer.from(binpb, 'base64'));
  const appReaction = ordReactionToReaction(ord.Reaction.toObject(parsedProtobuf));
  convertReactionFloatsToDoubles(appReaction);
  const previews = getReactionPreviews(appReaction, molblocks);

  return {
    id: `template_${id}`,
    variables: JSON.parse(variables),
    previews,
    data: appReaction,
    ...rest,
  };
};

export const getTemplate = createThunk(getTemplateActions, async (_d, _s, templateId) => {
  const result = await axiosInstance.get<TemplateResponse>(`/templates/${templateId}`);
  const template = parseTemplate(result.data);
  return getTemplateActions.success(template);
});

export const getAllTemplates = createThunk(getAllTemplatesActions, async (_d, _s) => {
  const result = await axiosInstance.get<Array<TemplateResponse>>(`/templates`);
  const templates = result.data;
  const parsedTemplates = templates.map(template => parseTemplate(template));

  return getAllTemplatesActions.success(parsedTemplates);
});

export const createTemplate = createThunkWithExplicitResult(
  createNewTemplateActions,
  async (dispatch, getState, templateLoad) => {
    const baseReaction = selectReactionById(templateLoad.reactionId)(getState());
    const ordReaction = reactionToOrdReaction(baseReaction.data);
    const binpb = Buffer.from(ord.Reaction.encode(ordReaction).finish()).toString('base64');
    const payload = {
      name: templateLoad.name,
      binpb: binpb,
      variables: JSON.stringify([]),
    };
    const templateData = (await axiosInstance.post<TemplateResponse>(`/templates`, payload)).data;
    const template = parseTemplate(templateData);

    dispatch(createNewTemplateActions.success(template));
    navigate(`/templates/${templateData.id}`);
  },
);

export const removeTemplate = createThunkWithExplicitResult(removeTemplateActions, async (dispatch, _s, templateId) => {
  const entityId = parseInt(templateId.split('_')[1]);
  await axiosInstance.delete(`/templates/${entityId}`);
  dispatch(removeTemplateActions.success(templateId));
  navigate(`/templates`);
});

export const renameTemplate = createThunk(renameTemplateActions, async (_d, getState, { templateId, name }) => {
  const baseReaction = selectReactionById(templateId)(getState());
  const ordReaction = reactionToOrdReaction(baseReaction.data);
  const binpb = Buffer.from(ord.Reaction.encode(ordReaction).finish()).toString('base64');
  const payload = {
    name: name,
    binpb: binpb,
    variables: JSON.stringify(baseReaction.variables),
  };
  const templateIdNumber = parseInt(templateId.split('_')[1]);
  const result = await axiosInstance.patch<TemplateResponse>(`templates/${templateIdNumber}`, payload);
  const template = parseTemplate(result.data);
  showNotification({ variant: NotificationVariant.SUCCESS, message: 'Template updated.' });

  return renameTemplateActions.success(template);
});
