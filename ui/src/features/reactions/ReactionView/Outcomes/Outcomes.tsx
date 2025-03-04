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
import type { ReactionViewSectionProps } from 'features/reactions/ReactionView/reactionView.types.ts';
import { useSelector } from 'react-redux';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors.ts';
import { ord } from 'ord-schema-protobufjs';
import { ActionIcon, Button, Flex, Title } from '@mantine/core';
import { Counter } from 'common/components/display/Counter/Counter.tsx';
import { AddCircleIcon, EditIcon, NoData } from 'common/icons';
import { buildUseCreate } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import { useCallback } from 'react';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { ReactionEntityDelete } from 'features/reactions/ReactionEntities/ReactionEntityDelete/ReactionEntityDelete.tsx';
import classes from 'features/reactions/ReactionView/Inputs/inputs.module.scss';
import { typographyClasses } from 'common/styling';
import type { ReactionOutcome } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.types.ts';
import { ordOutcomeToReactionOutcome } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.converters.ts';

const useCreate = buildUseCreate('outcomes', newIndex => [
  newIndex,
  ordOutcomeToReactionOutcome(ord.ReactionOutcome.toObject(new ord.ReactionOutcome())),
]);

export function Outcomes({ reactionId }: ReactionViewSectionProps) {
  const dispatch = useAppDispatch();
  const outcomes: Array<ReactionOutcome> = useSelector(selectReactionPartByPath(reactionId, ['outcomes']));
  const onCreateNew = useCreate();

  const handleCreate = () => {
    onCreateNew(outcomes.length, outcomes);
  };
  const onEdit = useCallback(
    (index: number) => {
      dispatch(setReactionPathComponentsList([['outcomes', index]]));
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
          <Title order={2}>Outcomes</Title>
          <Counter amount={outcomes.length} />
        </Flex>
        <Button
          onClick={handleCreate}
          leftSection={<AddCircleIcon />}
        >
          Outcome
        </Button>
      </Flex>
      <span>Outcomes record timestamped analyses and, optionally, product characterization</span>
      {outcomes.length > 0 ? (
        <div>
          {outcomes.map((outcome, index) => (
            <Flex
              key={outcome.id}
              align="center"
            >
              <span>Outcome {index + 1}</span>
              <ActionIcon
                variant="white"
                onClick={() => onEdit(index)}
              >
                <EditIcon />
              </ActionIcon>
              <ReactionEntityDelete
                reactionId={reactionId}
                entityName="Outcome"
                pathComponents={['outcomes', index]}
              />
            </Flex>
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
