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
import type { ReactionSectionProps } from '../reactionPage.types.ts';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { useSelector } from 'react-redux';
import { AddCircleIcon, EditIcon, RemoveIcon } from 'common/icons';
import { ord } from 'ord-schema-protobufjs';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { useCallback } from 'react';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions.ts';
import { deleteReactionField, addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';

const entries = Object.entries(ord.ReactionIdentifier.ReactionIdentifierType) as Array<[string, number]>;

const reactionIdentifierKeyByValue: Record<number, string> = entries.reduce(
  (acc: Record<number, string>, [key, value]: [string, number]) => {
    return { ...acc, [value]: key };
  },
  {},
);

const reactionIdentifierTypeValueToKey = (value?: number | null): string =>
  value ? reactionIdentifierKeyByValue[value] : '';

export function Identifiers({ reactionId }: ReactionSectionProps) {
  const dispatch = useAppDispatch();
  const reaction = useSelector(selectReactionById(reactionId));
  const identifiers = reaction.data.identifiers || [];

  const onIdentifierCreate = useCallback(() => {
    const newIdentifierPath: ReactionPathComponents = ['identifiers', identifiers.length];
    const newIdentifier = ord.ReactionIdentifier.toObject(new ord.ReactionIdentifier());

    dispatch(addUpdateReactionField({ reactionId, pathComponents: newIdentifierPath, newValue: newIdentifier }));
    dispatch(setReactionPathComponentsList([newIdentifierPath]));
  }, [reactionId, identifiers.length, dispatch]);

  const onIdentifierEdit = useCallback(
    (index: number) => {
      dispatch(setReactionPathComponentsList([['identifiers', index]]));
    },
    [dispatch],
  );

  const deleteIdentifier = useCallback(
    (index: number) => {
      dispatch(deleteReactionField({ reactionId, pathComponents: ['identifiers', index] }));
    },
    [dispatch, reactionId],
  );

  return (
    <Flex
      direction="column"
      gap="sm"
    >
      <Flex
        justify="space-between"
        align="center"
      >
        <Flex
          align="center"
          gap="sm"
        >
          <Title order={2}>Identifiers</Title>
          <Counter amount={identifiers.length} />
        </Flex>
        <Button
          onClick={onIdentifierCreate}
          leftSection={<AddCircleIcon />}
        >
          Identifier
        </Button>
      </Flex>
      <span>Reaction identifiers define descriptions of the overall reaction</span>

      <Flex
        direction="column"
        gap="sm"
        key={identifiers.length}
      >
        {identifiers.map((identifier, index) => (
          <div key={index}>
            <ActionIcon
              variant="white"
              color="red"
              onClick={() => deleteIdentifier(index)}
            >
              <RemoveIcon />
            </ActionIcon>
            <ActionIcon
              variant="white"
              onClick={() => onIdentifierEdit(index)}
            >
              <EditIcon />
            </ActionIcon>
            <div>{reactionIdentifierTypeValueToKey(identifier.type)}</div>
            <div>{identifier.details}</div>
            <div>{identifier.value}</div>
          </div>
        ))}
      </Flex>
    </Flex>
  );
}
