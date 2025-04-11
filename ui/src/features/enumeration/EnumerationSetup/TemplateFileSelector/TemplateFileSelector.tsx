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
import { Anchor, FileInput, Flex, Select, Title } from '@mantine/core';
import classes from '../enumerationSetup.module.scss';
import { useSelector } from 'react-redux';
import { selectTemplates } from 'store/entities/templates/templates.selectors.ts';
import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import { Buffer } from 'buffer';
import { parse } from 'csv-parse/sync';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { guessDelimiter } from './templateFileSelector.utils.ts';
import type { VariableMatch } from 'store/entities/enumeration/enumeration.types.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { downloadTemplateCsv } from 'store/entities/templates/templates.thunks.ts';
import { DownloadIcon } from 'common/icons';
import type { CastingContext } from 'csv-parse';
import { NUMBER_REGEX } from 'common/constants.ts';
import { NotificationVariant } from 'common/types/notification.ts';
import { showNotification } from 'common/utils/showNotification.tsx';

interface TemplateFileSelectorProps {
  templateDisabled: boolean;
  form: EnumerationForm;
}

function cast(value: string, context: CastingContext): string | number | boolean {
  if (context.header) {
    return value;
  }
  const lowerCaseValue = value.toLowerCase();
  if (['true', 'false'].includes(lowerCaseValue)) {
    return lowerCaseValue === 'true';
  }
  if (NUMBER_REGEX.test(value)) {
    const parsedValue = parseFloat(value);
    if (!Number.isNaN(parsedValue)) {
      return parsedValue;
    }
  }

  return value;
}

function validateHeaders(headers: Array<string>): boolean {
  const namesSet = new Set(headers);
  if (namesSet.size !== headers.length) {
    showNotification({ variant: NotificationVariant.ERROR, message: 'Duplicate column names are not allowed' });
    return false;
  }
  return true;
}

export function TemplateFileSelector({ form, templateDisabled }: Readonly<TemplateFileSelectorProps>) {
  const dispatch = useAppDispatch();
  const templates = useSelector(selectTemplates);
  const [isCsvFileParsing, setIsCsvFileParsing] = useState(false);

  const { templateId } = form.values;

  const templateOptions = useMemo(() => {
    return templates
      .filter(item => Object.keys(item.variables).length > 0)
      .map(template => ({
        label: template.name,
        value: template.id,
      }));
  }, [templates]);
  const template = useSelector(selectReactionById(templateId));
  const templateSelectProps = form.getInputProps('templateId');
  const name = template?.name ?? '';

  const handleTemplateSelection = (templateId: string | null) => {
    form.setValues(prevState => ({
      ...prevState,
      templateId: templateId ?? '',
      matching: [],
      csvFile: null,
      templateCSV: null,
    }));
  };

  const downloadTemplateAsCSV = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      if (templateId) {
        dispatch(downloadTemplateCsv(templateId));
      }
    },
    [dispatch, templateId],
  );

  const templateLabel = useMemo(() => {
    if (!templateId) {
      return 'Template';
    }
    return (
      <Flex
        align="center"
        gap="sm"
      >
        Template
        <Anchor
          onClick={downloadTemplateAsCSV}
          className={classes.templateLabelAnchor}
        >
          <DownloadIcon />
          {name}.csv
        </Anchor>
      </Flex>
    );
  }, [downloadTemplateAsCSV, name, templateId]);

  const handleFileSelection = async (file: File | null) => {
    form.setFieldValue('csvFile', file);
    setIsCsvFileParsing(true);
    if (file) {
      try {
        const buffer = await file.arrayBuffer();
        const newValue = Buffer.from(buffer).toString();
        const delimiter = guessDelimiter(newValue);
        const [headers] = parse(newValue, { delimiter });
        if (!validateHeaders(headers)) {
          form.setFieldValue('csvFile', null);
          return;
        }

        const content = parse(newValue, { delimiter, cast: cast, columns: true });
        form.setFieldValue('templateCSV', {
          headers,
          content,
        });

        const matching: Array<VariableMatch> = Object.values(template.variables).map((variable): VariableMatch => {
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
            label={templateLabel}
            placeholder="Select"
            data={templateOptions}
            searchable
            {...templateSelectProps}
            disabled={templateDisabled}
            onChange={handleTemplateSelection}
            nothingFoundMessage="No templates with variables in the system"
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
