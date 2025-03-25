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
import type { EnumerationForm } from '../enumerationSetup.types.ts';
import { ReactionEntityBlockTitle } from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';
import { FileInput, Flex, Select, Title } from '@mantine/core';
import classes from '../enumerationSetup.module.scss';
import { useSelector } from 'react-redux';
import { selectTemplates } from 'store/entities/templates/templates.selectors.ts';
import { useMemo, useState } from 'react';
import { Buffer } from 'buffer';
import { parse } from 'csv-parse/sync';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { guessDelimiter } from './templateFileSelector.utils.ts';
import type { VariableMatch } from 'store/entities/enumeration/enumeration.types.ts';

interface TemplateFileSelectorProps {
  form: EnumerationForm;
}

type ParseOptions = Parameters<typeof parse>[1];

export function TemplateFileSelector({ form }: Readonly<TemplateFileSelectorProps>) {
  const templates = useSelector(selectTemplates);
  const [isCsvFileParsing, setIsCsvFileParsing] = useState(false);

  const { templateId } = form.values;

  const templateOptions = useMemo(() => {
    return templates.map(template => ({
      label: template.name,
      value: template.id,
    }));
  }, [templates]);
  const template = useSelector(selectReactionById(templateId));
  const templateSelectProps = form.getInputProps('templateId');

  const handleTemplateSelection = (templateId: string | null) => {
    form.setValues(prevState => ({
      ...prevState,
      templateId: templateId ?? '',
      matching: [],
      csvFile: null,
      templateCSV: null,
    }));
  };

  const handleFileSelection = async (file: File | null) => {
    form.setFieldValue('csvFile', file);
    setIsCsvFileParsing(true);
    if (file) {
      try {
        const buffer = await file.arrayBuffer();
        const newValue = Buffer.from(buffer).toString();
        const delimiter = guessDelimiter(newValue);
        const options: ParseOptions = {
          cast: true,
          delimiter,
        };
        const [headers] = parse(newValue, options);
        const content = parse(newValue, { ...options, columns: true });
        form.setFieldValue('templateCSV', {
          headers,
          content,
        });

        const matching: Array<VariableMatch> = template.variables.map((variable): VariableMatch => {
          const csvColumn = headers.includes(variable.name) ? variable.name : null;
          return { variable: variable.name, csvColumn };
        });
        form.setFieldValue('matching', matching);
      } finally {
        setIsCsvFileParsing(false);
      }
    }
  };

  const isTemplateSelected = !!templateId;

  return (
    <>
      <ReactionEntityBlockTitle leftSection={<Title order={3}> Template and file </Title>} />
      <Flex
        direction="column"
        gap="sm"
        className={classes.container}
      >
        <div className={classes.twoItemsRow}>
          <Select
            label="Template"
            placeholder="Select"
            data={templateOptions}
            searchable
            {...templateSelectProps}
            onChange={handleTemplateSelection}
          />
          <FileInput
            label="CSV for Enumeration"
            placeholder="Attach file"
            accept="text/csv"
            disabled={!isTemplateSelected || isCsvFileParsing}
            {...form.getInputProps('csvFile')}
            onChange={handleFileSelection}
          />
        </div>
      </Flex>
    </>
  );
}
