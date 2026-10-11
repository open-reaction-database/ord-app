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
import { Button, Flex, Title } from '@mantine/core';
import { Counter } from '@open-reaction-database/ui/display';
import { AddCircleIcon, NoData } from 'common/icons';
import classes from './inputs.module.scss';
import { typographyClasses } from '@open-reaction-database/ui/theme';
import {
  createEmptyReactionInput,
  type ReactionInput,
} from '@open-reaction-database/ui/reaction/model';
import { findReactionEntityUniqueName } from 'features/reactions/ReactionEntities/findReactionEntityUniqueName.ts';
import { buildUseCreate } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import { InputsComponentsList } from 'features/reactions/ReactionView/Inputs/InputsComponentsList/InputsComponentsList.tsx';
import { ReactionNodeValidationResult } from '../../ReactionInteractions/ReactionNodeValidationResult/ReactionNodeValidationResult.tsx';
import { useIsViewOnly, useOrderedInputs } from '@open-reaction-database/ui/reaction';

const ENTITY_FIELD = 'inputs';

const useCreate = buildUseCreate<ReactionInput>(
  ENTITY_FIELD,
  (_, list): [string, ReactionInput] => {
    const newInputName = findReactionEntityUniqueName(
      'Input',
      list.map(input => input.name),
    );
    const appReactionInput = createEmptyReactionInput(newInputName);
    return [appReactionInput.id, appReactionInput];
  },
);

export function Inputs() {
  const isViewOnly = useIsViewOnly();
  const inputs = useOrderedInputs();

  const onCreateNew = useCreate();
  const handleCreate = () => {
    onCreateNew(0, inputs);
  };

  return (
    <Flex direction="column">
      <Flex justify="space-between">
        <Flex
          align="center"
          gap="sm"
        >
          <Title order={2}>Inputs</Title>
          <Counter amount={inputs.length} />
          <ReactionNodeValidationResult pathComponents={[ENTITY_FIELD]} />
        </Flex>
        {!isViewOnly ? (
          <Button
            onClick={handleCreate}
            leftSection={<AddCircleIcon />}
          >
            Input
          </Button>
        ) : null}
      </Flex>
      <span>Reaction inputs include every chemical added to the reaction vessel</span>
      {inputs.length > 0 ? (
        <InputsComponentsList inputs={inputs} />
      ) : (
        <Flex
          direction="column"
          align="center"
          gap="sm"
        >
          <NoData className={classes.icon} />
          <span className={typographyClasses.secondary1}>There are no Inputs yet</span>
        </Flex>
      )}
    </Flex>
  );
}
