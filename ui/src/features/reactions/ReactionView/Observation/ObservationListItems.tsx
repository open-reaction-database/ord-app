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
import { Flex } from '@mantine/core';
import { KeyValueDisplay } from 'common/components/display/KeyValueDisplay/KeyValueDisplay';
import { reactionContext } from 'features/reactions/reactions.context';
import { useContext } from 'react';
import { renderValuePrecisionUnit } from '../renderValuePrecisionUnit';
import type { ObservationCardProps } from './Observation.types';
import { ENTITY_FIELD } from './Observation';

export function ObservationListItem({ observation, index }: Readonly<ObservationCardProps>) {
  const time = observation.reactionTime;
  const { ViewDeleteButtonsComponent } = useContext(reactionContext);

  return (
    <Flex direction="column">
      <Flex
        direction="row"
        align="center"
      >
        <span>Identifier {index + 1}</span>
        <ViewDeleteButtonsComponent
          entityName="Identifier"
          pathComponents={[ENTITY_FIELD, index]}
        />
      </Flex>

      <Flex
        align="center"
        gap="xs"
      >
        <KeyValueDisplay
          label="Time"
          value={time && time.value ? renderValuePrecisionUnit(time) : ''}
        />
      </Flex>
      {observation.comment && observation.comment.trim() !== '' && (
        <KeyValueDisplay
          label="Comment"
          value={observation.comment}
          multiline
        />
      )}
    </Flex>
  );
}
