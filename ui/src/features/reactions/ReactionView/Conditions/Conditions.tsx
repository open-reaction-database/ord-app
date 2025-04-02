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
import { Counter } from 'common/components/display/Counter/Counter';
import { AddCircleIcon } from 'common/icons';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents';
import { reactionContext } from 'features/reactions/reactions.context';
import { ord } from 'ord-schema-protobufjs';
import { useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';
import { ordConditionsToReactionConditions } from 'store/entities/reactions/reactionConditions/reactionConditions.converter';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions';
import { useAppDispatch } from 'store/useAppDispatch';
import type { ReactionViewSectionProps } from '../reactionView.types';
import { EntityListItem } from 'features/reactions/ReactionEntities/entityFormConfiguration/EntityListItem/EntityListItem';

export const ENTITY_FIELD = 'conditions';

export function Conditions({ reactionId }: ReactionViewSectionProps) {
  const dispatch = useAppDispatch();
  const reaction = useSelector(selectReactionById(reactionId));
  const conditions = reaction.data.conditions || [];

  const onConditionsCreate = useCallback(() => {
    const newIdentifierPath: ReactionPathComponents = [ENTITY_FIELD, conditions.length];
    const newConditions = ordConditionsToReactionConditions(new ord.ReactionConditions());

    dispatch(addUpdateReactionField({ reactionId, pathComponents: newIdentifierPath, newValue: newConditions }));
    dispatch(setReactionPathComponentsList([newIdentifierPath]));
  }, [reactionId, conditions.length, dispatch]);

  const { isViewOnly } = useContext(reactionContext);

  return (
    <Flex direction="column">
      <Flex justify="space-between">
        <Flex
          align="center"
          gap="sm"
        >
          <Title order={2}>Conditions</Title>
          <Counter amount={conditions.length} />
        </Flex>
        {!isViewOnly && (
          <Button
            onClick={onConditionsCreate}
            leftSection={<AddCircleIcon />}
          >
            Conditions
          </Button>
        )}
      </Flex>
      <Flex
        direction="column"
        gap="sm"
      >
        {conditions.map((condition, index) => (
          <EntityListItem
            key={condition.id}
            entityKey={index}
            entityField="condition"
            title="Conditions"
            requiredFields={[
              {
                label: 'Details',
                render({ details }) {
                  return details;
                },
              },
            ]}
            entity={condition}
          />
        ))}
      </Flex>
    </Flex>
  );
}
