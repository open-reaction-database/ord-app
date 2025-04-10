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
import { AddCircleIcon } from 'common/icons';
import type { ReactionViewSectionProps } from '../reactionView.types';
import { useSelector } from 'react-redux';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors';
import { Counter } from 'common/components/display/Counter/Counter';
import { useCallback, useContext } from 'react';
import { reactionContext } from 'features/reactions/reactions.context';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions';
import { useAppDispatch } from 'store/useAppDispatch';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents';
import { ord } from 'ord-schema-protobufjs';
import { ordObservationToReactionObservation } from 'store/entities/reactions/reactionObservation/reactionObservation.converter';
import { EntityListItem } from 'features/reactions/ReactionEntities/entityFormConfiguration/EntityListItem/EntityListItem';
import { renderValuePrecisionUnit } from '../renderValuePrecisionUnit';
import { AppDataDisplay } from 'features/reactions/ReactionEntities/entityFormConfiguration/AppDataDisplay';

const ENTITY_FIELD = 'observations';

export function Observation({ reactionId }: ReactionViewSectionProps) {
  const dispatch = useAppDispatch();
  const reaction = useSelector(selectReactionById(reactionId));
  const observations = reaction.data.observations || [];

  const onObservationsCreate = useCallback(() => {
    const newIdentifierPath: ReactionPathComponents = [ENTITY_FIELD, observations.length];
    const newObservation = ordObservationToReactionObservation(
      ord.ReactionObservation.toObject(new ord.ReactionObservation()),
    );

    dispatch(addUpdateReactionField({ reactionId, pathComponents: newIdentifierPath, newValue: newObservation }));
    dispatch(setReactionPathComponentsList([newIdentifierPath]));
  }, [reactionId, observations.length, dispatch]);

  const { isViewOnly } = useContext(reactionContext);

  return (
    <Flex direction="column">
      <Flex justify="space-between">
        <Flex
          align="center"
          gap="sm"
        >
          <Title order={2}>Observations</Title>
          <Counter amount={observations.length} />
        </Flex>
        {!isViewOnly && (
          <Button
            onClick={onObservationsCreate}
            leftSection={<AddCircleIcon />}
          >
            Observation
          </Button>
        )}
      </Flex>
      <span>Observations are time-stamped comments, images, etc. that are recorded during the reaction</span>
      <Flex
        direction="column"
        gap="sm"
      >
        {observations.map((observation, index) => (
          <EntityListItem
            key={observation.id}
            entityKey={index}
            title="Observation"
            entityField="observations"
            entity={observation}
            requiredFields={[
              {
                label: 'Time',
                render: ({ time }) => {
                  return time?.value ? renderValuePrecisionUnit(time) : '';
                },
              },
              {
                label: 'Data',
                render: ({ image }) => {
                  return <AppDataDisplay appData={image} />;
                },
              },
            ]}
            optionalFields={[
              {
                label: 'Comment',
                render({ comment }) {
                  return comment;
                },
              },
              {
                label: 'Description',
                render({ image }) {
                  return image.description;
                },
              },
            ]}
          />
        ))}
      </Flex>
    </Flex>
  );
}
