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
import { Flex, Title } from '@mantine/core';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors';
import { RequiredOptionalFields } from 'common/components/display/RequiredOptionalFields/RequiredOptionalFields';
import type { ReactionViewSectionProps } from '../reactionView.types';
import type { ReactionSetup } from 'store/entities/reactions/reactionSetup/reactionSetup.types';
import { useSelector } from 'react-redux';
import { OpenSingleEntityButton } from '../OpenSingleEntityButton/OpenSingleEntityButton.tsx';

const ENTITY_FIELD = 'setup';

export function Setup({ reactionId }: ReactionViewSectionProps) {
  const setup = useSelector(selectReactionPartByPath(reactionId, [ENTITY_FIELD]));

  return (
    <Flex direction="column">
      <Flex justify="space-between">
        <Flex
          align="center"
          gap="sm"
        >
          <Title order={2}>Setup</Title>
        </Flex>
        <OpenSingleEntityButton pathComponents={[ENTITY_FIELD]} />
      </Flex>
      <RequiredOptionalFields
        entity={setup}
        requiredFields={[
          { label: 'Vessel', render: (setup: ReactionSetup) => setup.vessel.type },
          { label: 'Details', render: (setup: ReactionSetup) => setup.vessel.details },
        ]}
      />
      <RequiredOptionalFields
        entity={setup}
        requiredFields={[
          { label: 'Material', render: (setup: ReactionSetup) => setup.vessel.material.type },
          { label: 'Details', render: (setup: ReactionSetup) => setup.vessel.material.details },
        ]}
      />
    </Flex>
  );
}
