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
import { Counter } from 'common/components/Counter/Counter';
import type { ReactionSectionProps } from '../reactionPage.types';
import { selectReactionById } from 'store/reactions/reactions.selectors';
import { useSelector } from 'react-redux';
import { AddCircleIcon } from 'common/icons';
import { ord } from 'ord-schema-protobufjs';
import { useAppDispatch } from 'store/useAppDispatch';
import { useCallback } from 'react';
import { setReactionPathComponentsList } from 'store/reactionForm/reactionForm.actions';

const entries = Object.entries(ord.ReactionIdentifier.ReactionIdentifierType) as Array<[string, number]>;

const reactionIdentifierKeyByValue: Record<number, string> = entries.reduce(
  (acc, [key, value]: [string, number]) => {
    return { ...acc, [value]: key };
  },
  {} as Record<number, string>,
);

const reactionIdentifierTypeValueToKey = (value?: number | null): string =>
  value ? reactionIdentifierKeyByValue[value] : '';

export function Identifiers({ reactionId }: ReactionSectionProps) {
  const dispatch = useAppDispatch();
  const reaction = useSelector(selectReactionById(reactionId));
  const identifiers = reaction.data.identifiers || [];

  const onIdentifierCreate = useCallback(() => {
    dispatch(setReactionPathComponentsList([['identifiers', identifiers.length]]));
  }, [identifiers.length, dispatch]);

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

      {identifiers.map(identifier => (
        <div key={identifier.value}>
          <div>{reactionIdentifierTypeValueToKey(identifier.type)}</div>
          <div>{identifier.details}</div>
          <div>{identifier.value}</div>
        </div>
      ))}
    </Flex>
  );
}
