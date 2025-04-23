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
  addUpdateVariableActions,
  removeVariableActions,
  importTemplateFromFileActions,
} from './templates.actions.ts';
import type { TemplateResponse, Variable } from './templates.types.ts';
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
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';
import type { ReactionTemplate } from 'store/entities/reactions/reactions.types.ts';
import { ordTemplateVariablesToReaction, reactionTemplateVariablesToOrd } from './temlpates.converters.ts';
import type { ThunkCustomWrapper } from 'common/types/store/thunk.ts';
import { downloadAsJson, downloadFile } from '../../utils/downloadFile.thunks.ts';
import { getReactionPreviews } from '../reactions/reactions.utils.ts';

const getTemplateIdNumber = (templateId: string): number => parseInt(templateId.split('_')[1]);
const getTemplateIdString = (templateId: number): string => `template_${templateId}`;

const parseTemplate = ({
  id,
  binpb,
  molblocks,
  variables: rawVariables,
  ...rest
}: TemplateResponse): ReactionTemplate => {
  const parsedProtobuf = ord.Reaction.decode(Buffer.from(binpb, 'base64'));
  const appReaction = ordReactionToReaction(ord.Reaction.toObject(parsedProtobuf));
  convertReactionFloatsToDoubles(appReaction);
  const previews = getReactionPreviews(appReaction, molblocks);
  const variablesParsed: Array<Variable> = JSON.parse(rawVariables);

  return {
    id: getTemplateIdString(id),
    variables: ordTemplateVariablesToReaction(variablesParsed, appReaction),
    previews,
    data: appReaction,
    ...rest,
  };
};

export const getTemplate = createThunk(getTemplateActions, templateId => async () => {
  const result = await axiosInstance.get<TemplateResponse>(`/templates/${templateId}`);
  const template = parseTemplate(result.data);
  return getTemplateActions.success(template);
});

export const getAllTemplates = createThunk(getAllTemplatesActions, () => async () => {
  const result = await axiosInstance.get<Array<TemplateResponse>>(`/templates`);
  const templates = result.data;
  const parsedTemplates = templates.map(template => parseTemplate(template));

  return getAllTemplatesActions.success(parsedTemplates);
});

export const createTemplate = createThunkWithExplicitResult(
  createNewTemplateActions,
  templateLoad => async (dispatch, getState) => {
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

export const removeTemplate = createThunkWithExplicitResult(
  removeTemplateActions,
  templateId => async (dispatch, _s) => {
    const entityId = getTemplateIdNumber(templateId);
    await axiosInstance.delete(`/templates/${entityId}`);
    dispatch(removeTemplateActions.success(templateId));
    navigate(`/templates`);
  },
);

export const renameTemplate = createThunk(renameTemplateActions, ({ templateId, name }) => async () => {
  const entityId = getTemplateIdNumber(templateId);
  const result = await axiosInstance.patch<TemplateResponse>(`templates/${entityId}`, { name });
  const template = parseTemplate(result.data);
  showNotification({ variant: NotificationVariant.SUCCESS, message: 'Template updated.' });

  return renameTemplateActions.success(template);
});

const syncVariablesWithBackend: ThunkCustomWrapper<string, Promise<void>> = templateId => async (_d, getState) => {
  const { variables, data: reaction } = selectReactionById(templateId)(getState());
  const variablesList = reactionTemplateVariablesToOrd(variables, reaction);
  const entityId = getTemplateIdNumber(templateId);
  await axiosInstance.patch<TemplateResponse>(`templates/${entityId}`, { variables: JSON.stringify(variablesList) });
  showNotification({ variant: NotificationVariant.SUCCESS, message: 'Template updated.' });
};

export const addUpdateVariable = createThunk(addUpdateVariableActions, ({ templateId }) => async (dispatch, _g) => {
  await dispatch(syncVariablesWithBackend(templateId));
  return addUpdateVariableActions.success();
});

export const removeVariable = createThunk(removeVariableActions, ({ templateId }) => async (dispatch, _g) => {
  await dispatch(syncVariablesWithBackend(templateId));
  return removeVariableActions.success();
});

export const downloadTemplateCsv: ThunkCustomWrapper<string> = (templateId: string) => (_d, getState) => {
  const { variables, data: reaction, name } = selectReactionById(templateId)(getState());
  const variablesList = reactionTemplateVariablesToOrd(variables, reaction);
  const content = variablesList.map(variable => variable.name).join(';');
  const blob = new Blob([content], { type: 'text/csv' });
  downloadFile(blob, `${name}.csv`);
};

export const downloadTemplateInJSON: ThunkCustomWrapper<string> = (templateId: string) => (_d, getState) => {
  const { variables, data: reaction, name } = selectReactionById(templateId)(getState());
  const variablesList = reactionTemplateVariablesToOrd(variables, reaction);
  const ordReaction = reactionToOrdReaction(reaction);
  const binpb = Buffer.from(ord.Reaction.encode(ordReaction).finish()).toString('base64');
  downloadAsJson({ variables: variablesList, binpb }, `${name}.json`);
};

export const importFromFile = createThunkWithExplicitResult(
  importTemplateFromFileActions,
  ({ name, file }) =>
    async dispatch => {
      try {
        const fileContentString = Buffer.from(await file.arrayBuffer()).toString();
        const { binpb, variables } = JSON.parse(fileContentString);
        if (!Array.isArray(variables)) {
          throw new Error('Incorrect variables schema');
        }
        const payload = {
          name: name,
          binpb: binpb,
          variables: JSON.stringify(variables),
        };
        const templateData = (await axiosInstance.post<TemplateResponse>(`/templates`, payload)).data;
        const template = parseTemplate(templateData);
        navigate(`/templates/${templateData.id}`);
        dispatch(importTemplateFromFileActions.success(template));
      } catch (e: unknown) {
        console.error(e);
        dispatch(importTemplateFromFileActions.failure('Incorrect template file provided'));
      }
    },
);
