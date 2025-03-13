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
import { downloadAsJson } from 'common/utils';

interface TemplateHeaderProps {
  templateId: number | string;
  isReadyForEnumeration: boolean;
}

export function TemplateHeader({ templateId, isReadyForEnumeration }: Readonly<TemplateHeaderProps>) {
  const template = useSelector(selectReactionById(templateId));

  const downloadAsJsonHandle = () => {
    downloadAsJson(template, `${template.data.reactionId}.json`);
  };

  return (
    <>
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
      >
        Download Variables in CSV
      </Button>
      <Button
        leftSection={<DownloadIcon />}
        variant="transparent"
        onClick={downloadAsJsonHandle}
      >
        Download Template in JSON
      </Button>
    </>
  );
}
