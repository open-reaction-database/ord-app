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
import { downloadAsJson, downloadFile } from 'store/utils/downloadFile.thunks.ts';
import { RemoveReaction } from 'features/reactions/RemoveReaction/RemoveReaction.tsx';
import { useCallback } from 'react';

interface TemplateHeaderActionsProps {
  templateId: string;
}

export function TemplateHeaderActions({ templateId }: Readonly<TemplateHeaderActionsProps>) {
  const template = useSelector(selectReactionById(templateId));
  const { variables, name } = template;

  const onJsonDownload = () => {
    downloadAsJson(template, `${name}.json`);
  };
  const onCSVDownload = useCallback(() => {
    const content = variables.map(variable => variable.name).join('; ');
    const blob = new Blob([content], { type: 'text/csv' });
    downloadFile(blob, `${name}.csv`);
  }, [name, variables]);

  const isReadyForEnumeration = template.variables.length > 0;

  return (
    <>
      <RemoveReaction reactionId={templateId} />
      <Button
        variant="transparent"
        leftSection={<EnumerateIcon />}
        disabled={!isReadyForEnumeration}
      >
        Enumerate
      </Button>
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
