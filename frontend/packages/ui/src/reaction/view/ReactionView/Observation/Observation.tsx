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
import { AddCircleIcon } from '#theme/icons/index.ts';
import { Counter } from '#display/Counter/Counter.tsx';
import { useCallback } from 'react';
import { type ReactionPathComponents } from '#reaction/model/reactionPathComponents.ts';
import {
  ordObservationToReaction,
  type ReactionObservation,
} from '#reaction/model/reactionObservation/reactionObservation.converter.ts';
import { create } from '@bufbuild/protobuf';
import { ReactionObservationSchema } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { EntityListItem } from '#reaction/view/ReactionEntities/entityFormConfiguration/EntityListItem/EntityListItem.tsx';
import { renderValuePrecisionUnit } from '#reaction/view/ReactionView/renderValuePrecisionUnit.ts';
import { AppDataDisplay } from '#reaction/view/ReactionEntities/entityFormConfiguration/AppDataDisplay.tsx';
import { ReactionNodeValidationResult } from '#reaction/view/ReactionInteractions/ReactionNodeValidationResult/ReactionNodeValidationResult.tsx';
import {
  useDrawer,
  useIsViewOnly,
  useReactionActions,
  useReactionPart,
} from '#reaction/provider/reactionProvider.hooks.ts';

const ENTITY_FIELD = 'observations';

export function Observation() {
  const drawer = useDrawer();
  const actions = useReactionActions();
  const observations =
    useReactionPart<Array<ReactionObservation>>([ENTITY_FIELD]) ?? [];
  const isViewOnly = useIsViewOnly();

  const onObservationsCreate = useCallback(() => {
    const newIdentifierPath: ReactionPathComponents = [
      ENTITY_FIELD,
      observations.length,
    ];
    const newObservation = ordObservationToReaction(create(ReactionObservationSchema));

    void actions?.update(newIdentifierPath, newObservation);
    drawer.set([newIdentifierPath]);
  }, [actions, observations.length, drawer]);

  return (
    <Flex direction="column">
      <Flex justify="space-between">
        <Flex
          align="center"
          gap="sm"
        >
          <Title order={2}>Observations</Title>
          <Counter amount={observations.length} />
          <ReactionNodeValidationResult pathComponents={[ENTITY_FIELD]} />
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
      <span>
        Observations are time-stamped comments, images, etc. that are recorded during
        the reaction
      </span>
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
                  // Observations have no name field; show the attached file under the positional
                  // "Observation N" name so it reads as a numbered name like Features do. (#613)
                  return (
                    <AppDataDisplay
                      appData={image}
                      fileNameOverride={`Observation ${index + 1}`}
                    />
                  );
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
