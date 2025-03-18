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
import { Counter } from 'common/components/display/Counter/Counter.tsx';
import { AddCircleIcon, NoData } from 'common/icons';
import classes from 'features/reactions/ReactionView/Inputs/inputs.module.scss';
import { typographyClasses } from 'common/styling';
import { useContext } from 'react';
import type { ReactionViewSectionProps } from 'features/reactions/ReactionView/reactionView.types.ts';
import { selectOrderedInputsWrapper } from 'store/entities/reactions/reactions.selectors.ts';
import { useSelector } from 'react-redux';
import { createEmptyReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.utils.ts';
import { findReactionEntityUniqueName } from 'features/reactions/ReactionEntities/findReactionEntityUniqueName.ts';
import { buildUseCreate } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import type { ReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import { InputsComponentsList } from 'features/reactions/ReactionView/Inputs/InputsComponentsList/InputsComponentsList.tsx';
import { templatesContext } from 'features/templates/templates.context';

const useCreate = buildUseCreate<ReactionInput>('inputs', (_, list) => {
  const newInputName = findReactionEntityUniqueName(
    'Input',
    list.map(input => input.name),
  );
  const appReactionInput = createEmptyReactionInput(newInputName);
  return [appReactionInput.id, appReactionInput];
});

export function Inputs({ reactionId }: ReactionViewSectionProps) {
  const { isTemplate } = useContext(templatesContext);
  const inputs = useSelector(selectOrderedInputsWrapper(reactionId)) || [];

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
        </Flex>
        {!isTemplate ? (
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
        <InputsComponentsList
          inputs={inputs}
          reactionId={reactionId}
        />
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
