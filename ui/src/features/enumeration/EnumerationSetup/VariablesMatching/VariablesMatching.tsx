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
import { Flex, Select, Text, Title } from '@mantine/core';
import classes from '../enumerationSetup.module.scss';
import { ReactionEntityBlockTitle } from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';
import clsx from 'clsx';
import type { EnumerationForm } from '../enumerationSetup.types.ts';
import { useSelector } from 'react-redux';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';

interface VariablesMatchingProps {
  form: EnumerationForm;
}

export function VariablesMatching({ form }: Readonly<VariablesMatchingProps>) {
  const { templateId, matching, templateCSV } = form.values;
  const template = useSelector(selectReactionById(templateId));
  const canMatch = matching.length > 0 && template && templateCSV?.headers;
  return (
    <Flex direction="column">
      <ReactionEntityBlockTitle leftSection={<Title order={3}>Matching</Title>} />
      {canMatch && (
        <Flex
          direction="column"
          className={clsx(classes.variablesList, classes.container)}
        >
          <div className={classes.twoItemsRow}>
            <Text className={classes.variablesTitle}>Template Fields</Text>
            <Text className={classes.variablesTitle}>Uploaded File Fields</Text>
          </div>
          {matching.map((item, index) => (
            <div
              key={item.variable}
              className={clsx(classes.twoItemsRow, classes.center)}
            >
              <span>@{item.variable}</span>
              <Select
                data={templateCSV?.headers}
                {...form.getInputProps(`matching.${index}.csvColumn`)}
              />
            </div>
          ))}
        </Flex>
      )}
    </Flex>
  );
}
