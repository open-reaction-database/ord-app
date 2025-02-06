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
import { AddCircleIcon, NoData } from 'common/icons';
import classes from './inputs.module.scss';
import { typographyClasses } from 'common/styling';
import type { ReactionSectionProps } from '../reactionPage.types';
import { selectReactionById } from 'store/reactions/reactions.selectors';
import { useSelector } from 'react-redux';
import { useCallback } from 'react';
import { setReactionPathComponentsList } from 'store/reactionForm/reactionForm.actions';
import { useAppDispatch } from 'store/useAppDispatch';

export function Inputs({ reactionId }: ReactionSectionProps) {
  const dispatch = useAppDispatch();
  const reaction = useSelector(selectReactionById(reactionId));
  const inputs = reaction.data.inputs ? Object.values(reaction.data.inputs) : [];

  const onCreateNew = useCallback(() => {
    const newIndex = inputs.length;
    dispatch(setReactionPathComponentsList([['inputs', newIndex.toString(), '1']]));
  }, [dispatch, inputs.length]);

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
      <Flex
        direction="column"
        align="center"
        gap="sm"
      >
        <NoData className={classes.icon} />
        <span className={typographyClasses.secondary1}>There are no Inputs yet</span>
      </Flex>
    </Flex>
  );
}
