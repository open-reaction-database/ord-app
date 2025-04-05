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
import { Button } from '@mantine/core';
import { useSelector } from 'react-redux';
import { EnumerateIcon, DownloadIcon } from 'common/icons';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { RemoveReaction } from 'features/reactions/RemoveReaction/RemoveReaction.tsx';
import { useCallback } from 'react';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { downloadTemplateCsv, downloadTemplateInJSON } from 'store/entities/templates/templates.thunks.ts';
import { EnumerationWizard } from '../../enumeration/EnumerationWizard.tsx';
import { setEnumerationSetupOpenedAction } from 'store/features/enumerationSetup/enumerationSetup.actions.ts';

interface TemplateHeaderActionsProps {
  templateId: string;
  showEnumeration?: boolean;
}

export function TemplateHeaderActions({ templateId, showEnumeration }: Readonly<TemplateHeaderActionsProps>) {
  const template = useSelector(selectReactionById(templateId));
  const dispatch = useAppDispatch();
  const { variables } = template;
  const variablesList = Object.values(variables);
  const openEnumerationSetup = useCallback(() => {
    dispatch(setEnumerationSetupOpenedAction(true));
  }, [dispatch]);

  const onJsonDownload = useCallback(() => {
    dispatch(downloadTemplateInJSON(templateId));
  }, [dispatch, templateId]);
  const onCSVDownload = useCallback(() => {
    dispatch(downloadTemplateCsv(templateId));
  }, [dispatch, templateId]);

  const isReadyForEnumeration = variablesList.length > 0;

  return (
    <>
      <RemoveReaction reactionId={templateId} />
      {showEnumeration && (
        <>
          <Button
            variant="transparent"
            leftSection={<EnumerateIcon />}
            disabled={!isReadyForEnumeration}
            onClick={openEnumerationSetup}
          >
            Enumerate
          </Button>
          <EnumerationWizard templateId={templateId} />
        </>
      )}
      <Button
        leftSection={<DownloadIcon />}
        variant="transparent"
        disabled={!isReadyForEnumeration}
        onClick={onCSVDownload}
      >
        Download Variables in CSV
      </Button>
      <Button
        leftSection={<DownloadIcon />}
        variant="transparent"
        onClick={onJsonDownload}
      >
        Download Template in JSON
      </Button>
    </>
  );
}
