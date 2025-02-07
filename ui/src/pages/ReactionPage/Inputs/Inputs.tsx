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
import { Counter } from 'common/components/Counter/Counter';
import { AddCircleIcon, EditIcon, NoData, RemoveIcon } from 'common/icons';
import classes from './inputs.module.scss';
import { typographyClasses } from 'common/styling';
import type { ReactionSectionProps } from '../reactionPage.types';
import { selectReactionById } from 'store/reactions/reactions.selectors';
import { useSelector } from 'react-redux';
import { useCallback } from 'react';
import { setReactionPathComponentsList } from 'store/reactionForm/reactionForm.actions';
import { useAppDispatch } from 'store/useAppDispatch';
import type { AppReactionInput } from 'store/reactions/reactions.types';
import { ord } from 'ord-schema-protobufjs';
import { addUpdateReactionField, deleteReactionField } from 'store/reactions/reactions.thunks';

function findValidInputName(inputs: Array<AppReactionInput>): string {
  let counter = 1;
  let isValid = false;
  let name: string = `Input ${counter}`;
  while (!isValid) {
    name = `Input ${counter}`;
    isValid = inputs.every(input => input.name !== name);
    counter++;
  }
  return name;
}

export function Inputs({ reactionId }: ReactionSectionProps) {
  const dispatch = useAppDispatch();
  const reaction = useSelector(selectReactionById(reactionId));
  const inputs = reaction.data.inputs || [];

  const onCreateNew = useCallback(() => {
    const newInputName = findValidInputName(inputs);
    const newOrdReaction = ord.ReactionInput.toObject(new ord.ReactionInput());
    const appReaction = { ...newOrdReaction, name: newInputName };
    const pathComponents = ['inputs', inputs.length];
    dispatch(addUpdateReactionField({ reactionId, pathComponents: pathComponents, newValue: appReaction }));
    dispatch(setReactionPathComponentsList([pathComponents]));
  }, [dispatch, reactionId, inputs]);

  const onDeleteInput = useCallback(
    (index: number) => {
      dispatch(deleteReactionField({ reactionId, pathComponents: ['inputs', index] }));
    },
    [dispatch, reactionId],
  );

  const onEditInput = useCallback(
    (index: number) => {
      dispatch(setReactionPathComponentsList([['inputs', index]]));
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
          {inputs.map((input, index) => (
            <div key={input.name}>
              <span>{input.name}</span>
              <ActionIcon
                variant="white"
                onClick={() => onEditInput(index)}
              >
                <EditIcon />
              </ActionIcon>
              <ActionIcon
                variant="white"
                color="red"
                onClick={() => onDeleteInput(index)}
              >
                <RemoveIcon />
              </ActionIcon>
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
