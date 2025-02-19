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
import { ActionIcon, Button, Flex, Title } from '@mantine/core';
import { Counter } from 'common/components/display/Counter/Counter.tsx';
import { AddCircleIcon, EditIcon, NoData } from 'common/icons';
import classes from './inputs.module.scss';
import { typographyClasses } from 'common/styling';
import type { ReactionSectionProps } from '../reactionPage.types.ts';
import { selectOrderedInputsWrapper } from 'store/entities/reactions/reactions.selectors.ts';
import { useSelector } from 'react-redux';
import { useCallback } from 'react';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import { createEmptyReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.utils.ts';
import { ReactionEntityDelete } from 'features/reactions/ReactionEntities/ReactionEntityDelete/ReactionEntityDelete.tsx';
import { findReactionEntityUniqueName } from 'features/reactions/ReactionEntities/findReactionEntityUniqueName.ts';

export function Inputs({ reactionId }: ReactionSectionProps) {
  const dispatch = useAppDispatch();
  const inputs = useSelector(selectOrderedInputsWrapper(reactionId));

  const onCreateNew = useCallback(() => {
    const newInputName = findReactionEntityUniqueName(
      'Input',
      inputs.map(input => input.name),
    );
    const appReactionInput = createEmptyReactionInput(newInputName);
    const pathComponents = ['inputs', appReactionInput.id];
    dispatch(addUpdateReactionField({ reactionId, pathComponents: pathComponents, newValue: appReactionInput }));
    dispatch(setReactionPathComponentsList([pathComponents]));
  }, [dispatch, reactionId, inputs]);

  const onEditInput = useCallback(
    (id: string) => {
      dispatch(setReactionPathComponentsList([['inputs', id]]));
    },
    [dispatch],
  );

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
        <Button
          onClick={onCreateNew}
          leftSection={<AddCircleIcon />}
        >
          Input
        </Button>
      </Flex>
      <span>Reaction inputs include every chemical added to the reaction vessel</span>
      {inputs.length > 0 ? (
        <div>
          {inputs.map(input => (
            <div key={input.id}>
              <span>{input.name}</span>
              <ActionIcon
                variant="white"
                onClick={() => onEditInput(input.id)}
              >
                <EditIcon />
              </ActionIcon>
              <ReactionEntityDelete
                reactionId={reactionId}
                entityName="Input"
                pathComponents={['inputs', input.id]}
              />
            </div>
          ))}
        </div>
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
