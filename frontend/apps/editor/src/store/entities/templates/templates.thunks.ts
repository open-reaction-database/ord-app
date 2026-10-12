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
  getAllTemplatesActions,
  removeTemplateActions,
  renameTemplateActions,
  addUpdateVariableActions,
  removeVariableActions,
  importTemplateFromFileActions,
  restoreSavedVariables,
} from './templates.actions.ts';
import type {
  SavedVariablesPayload,
  TemplateResponse,
  Variable,
} from './templates.types.ts';
import type { Action } from '@reduxjs/toolkit';
import { createThunk, createThunkWithExplicitResult } from 'store/utils';
import axiosInstance from 'store/axiosInstance.ts';
import { createStoreSaveQueues, SAVE_TIMEOUT_MS } from 'store/utils/saveQueue.ts';
import {
  templateIdFromNumber,
  templateNumberFromId,
  templatePath,
} from './templateIds.ts';
import {
  ordBinpbToReaction,
  reactionToOrdBinpb,
  getReactionPreviews,
} from '@open-reaction-database/ui/reaction/model';
import { navigate } from 'wouter/use-browser-location';
import { selectReactionById } from '../reactions/reactions.selectors.ts';
import {
  showNotification,
  NotificationVariant,
} from '@open-reaction-database/ui/display';
import type { ReactionTemplate } from 'store/entities/reactions/reactionsStore.types.ts';
import {
  ordTemplateVariablesToReaction,
  reactionTemplateVariablesToOrd,
} from './templates.converters.ts';
import type { ThunkCustomWrapper } from 'common/types/store/thunk.ts';
import { downloadAsJson, downloadFile } from '../../utils/downloadFile.thunks.ts';

const parseTemplate = ({
  id,
  binpb,
  molblocks,
  variables: rawVariables,
  ...rest
}: TemplateResponse): ReactionTemplate => {
  const appReaction = ordBinpbToReaction(binpb);
  const previews = getReactionPreviews(appReaction, molblocks);
  const variablesParsed: Array<Variable> = JSON.parse(rawVariables);

  return {
    id: templateIdFromNumber(id),
    variables: ordTemplateVariablesToReaction(variablesParsed, appReaction),
    previews,
    data: appReaction,
    ...rest,
  };
};

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
    const binpb = reactionToOrdBinpb(baseReaction.data);
    const payload = {
      name: templateLoad.name,
      binpb: binpb,
      variables: JSON.stringify([]),
    };
    const templateData = (
      await axiosInstance.post<TemplateResponse>(`/templates`, payload)
    ).data;
    const template = parseTemplate(templateData);

    dispatch(createNewTemplateActions.success(template));
    navigate(templatePath(templateData.id));
  },
);

export const removeTemplate = createThunkWithExplicitResult(
  removeTemplateActions,
  templateId => async (dispatch, _s) => {
    const entityId = templateNumberFromId(templateId);
    await axiosInstance.delete(`/templates/${entityId}`);
    dispatch(removeTemplateActions.success(templateId));
    navigate(`/templates`);
  },
  { failureMessage: 'Failed to remove template.' },
);

export const renameTemplate = createThunk(
  renameTemplateActions,
  ({ templateId, name }) =>
    async () => {
      const entityId = templateNumberFromId(templateId);
      const result = await axiosInstance.patch<TemplateResponse>(
        `templates/${entityId}`,
        { name },
      );
      const template = parseTemplate(result.data);
      showNotification({
        variant: NotificationVariant.SUCCESS,
        message: 'Template updated.',
      });

      return renameTemplateActions.success(template);
    },
  { failureMessage: 'Failed to rename template.' },
);

// Each save sends every variable, so saves of one template run one at a time, in order.
const variablesSaveQueues = createStoreSaveQueues<string>();

/**
 * Saves the template's unsaved variable edits once earlier saves settle, and records the outcome
 * before the next save starts. Saves nothing when none are left: an earlier save sent them, or a
 * failed one rolled them back, or the template was removed.
 */
const saveEditedVariables: ThunkCustomWrapper<
  {
    templateId: string;
    succeeded: (payload: SavedVariablesPayload) => Action;
  },
  Promise<void>
> =
  ({ templateId, succeeded }) =>
  (dispatch, getState) =>
    variablesSaveQueues(getState)(templateId, async () => {
      const template = selectReactionById(templateId)(getState()) as
        | ReactionTemplate
        | undefined;
      if (template?.variablesBeforeEdit === undefined) {
        return;
      }
      const { variables, data: reaction } = template;
      try {
        const variablesList = reactionTemplateVariablesToOrd(variables, reaction);
        await axiosInstance.patch<TemplateResponse>(
          `templates/${templateNumberFromId(templateId)}`,
          { variables: JSON.stringify(variablesList) },
          { timeout: SAVE_TIMEOUT_MS },
        );
      } catch (e) {
        dispatch(restoreSavedVariables(templateId));
        throw e;
      }
      dispatch(succeeded({ templateId, savedVariables: variables }));
      showNotification({
        variant: NotificationVariant.SUCCESS,
        message: 'Template updated.',
      });
    });

export const addUpdateVariable = createThunkWithExplicitResult(
  addUpdateVariableActions,
  ({ templateId }) =>
    async dispatch => {
      await dispatch(
        saveEditedVariables({
          templateId,
          succeeded: addUpdateVariableActions.success,
        }),
      );
    },
  { failureMessage: 'Failed to update template variables.' },
);

export const removeVariable = createThunkWithExplicitResult(
  removeVariableActions,
  ({ templateId }) =>
    async dispatch => {
      await dispatch(
        saveEditedVariables({ templateId, succeeded: removeVariableActions.success }),
      );
    },
  { failureMessage: 'Failed to update template variables.' },
);

export const downloadTemplateCsv: ThunkCustomWrapper<string> =
  (templateId: string) => (_d, getState) => {
    const {
      variables,
      data: reaction,
      name,
    } = selectReactionById(templateId)(getState());
    const variablesList = reactionTemplateVariablesToOrd(variables, reaction);
    const content = variablesList.map(variable => variable.name).join(';');
    const blob = new Blob([content], { type: 'text/csv' });
    downloadFile(blob, `${name}.csv`);
  };

export const downloadTemplateInJSON: ThunkCustomWrapper<string> =
  (templateId: string) => (_d, getState) => {
    const {
      variables,
      data: reaction,
      name,
    } = selectReactionById(templateId)(getState());
    const variablesList = reactionTemplateVariablesToOrd(variables, reaction);
    const binpb = reactionToOrdBinpb(reaction);
    downloadAsJson({ variables: variablesList, binpb }, `${name}.json`);
  };

export const importFromFile = createThunkWithExplicitResult(
  importTemplateFromFileActions,
  ({ name, file }) =>
    async dispatch => {
      try {
        const fileContentString = await file.text();
        const { binpb, variables } = JSON.parse(fileContentString);
        if (!Array.isArray(variables)) {
          throw new TypeError('Incorrect variables schema');
        }
        const payload = {
          name: name,
          binpb: binpb,
          variables: JSON.stringify(variables),
        };
        const templateData = (
          await axiosInstance.post<TemplateResponse>(`/templates`, payload)
        ).data;
        const template = parseTemplate(templateData);
        navigate(templatePath(templateData.id));
        dispatch(importTemplateFromFileActions.success(template));
      } catch (e: unknown) {
        console.error(e);
        dispatch(
          importTemplateFromFileActions.failure('Incorrect template file provided'),
        );
      }
    },
);
