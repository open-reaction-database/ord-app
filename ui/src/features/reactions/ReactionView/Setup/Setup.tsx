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
import classes from './setup.module.scss';
import { useSelector } from 'react-redux';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors';
import { RequiredOptionalFields } from 'common/components/display/RequiredOptionalFields/RequiredOptionalFields';
import type { ReactionViewSectionProps } from '../reactionView.types';
import type { ReactionSetup } from 'store/entities/reactions/reactionSetup/reactionSetup.types';
import { EntityListItem } from 'features/reactions/ReactionEntities/entityFormConfiguration/EntityListItem/EntityListItem';
import { OpenSingleEntityButton } from 'features/reactions/ReactionView/OpenSingleEntityButton/OpenSingleEntityButton';
import type { AppData } from 'store/entities/reactions/reactionData/reactionData.types';

const ENTITY_FIELD = 'setup';

export function Setup({ reactionId }: ReactionViewSectionProps) {
  const setup: ReactionSetup = useSelector(selectReactionPartByPath(reactionId, [ENTITY_FIELD]));

  return (
    <Flex direction="column">
      <Flex justify="space-between">
        <Flex
          align="center"
          gap="lg"
        >
          <Title order={2}>Setup</Title>
        </Flex>
        <OpenSingleEntityButton pathComponents={[ENTITY_FIELD]} />
      </Flex>
      <Flex direction="column">
        <Flex className={classes.container}>
          <RequiredOptionalFields
            entity={setup}
            requiredFields={[
              { label: 'Vessel', render: setup => setup.vessel.type },
              { label: 'Details', render: setup => setup.vessel.details },
            ]}
          />
        </Flex>
        <RequiredOptionalFields
          entity={setup}
          requiredFields={[
            { label: 'Material', render: setup => setup.vessel.material.type },
            { label: 'Details', render: setup => setup.vessel.material.details },
          ]}
        />
        {Object.entries(setup.automationCode as Record<string, AppData>).map(([id, automationCode], index) => (
          <EntityListItem
            key={id}
            historyPathComponents={[[ENTITY_FIELD]]}
            entityField={[ENTITY_FIELD, 'automationCode', id]}
            title={`Automation Code`}
            requiredFields={[
              { label: 'Type', render: (entity: AppData) => entity.data.type },
              { label: 'Value', render: (entity: AppData) => entity.data.value },
              { label: 'Description', render: (entity: AppData) => entity.description },
            ]}
            entity={automationCode}
            entityKey={index}
          />
        ))}
        {setup.vessel.preparations.map((preparations, index) => (
          <EntityListItem
            key={preparations.id}
            historyPathComponents={[[ENTITY_FIELD]]}
            entityField={[ENTITY_FIELD, 'vessel', 'preparations', index.toString()]}
            title={`Vessel Preparation`}
            requiredFields={[
              { label: 'Type', render: ({ type }) => type },
              { label: 'Details', render: ({ details }) => details },
            ]}
            entity={preparations}
            entityKey={index}
          />
        ))}
        {setup.vessel.attachments.map((attachments, index) => (
          <EntityListItem
            key={attachments.id}
            historyPathComponents={[[ENTITY_FIELD]]}
            entityField={[ENTITY_FIELD, 'vessel', 'attachments', index.toString()]}
            title={`Vessel Attachments`}
            requiredFields={[
              { label: 'Type', render: ({ type }) => type },
              { label: 'Details', render: ({ details }) => details },
            ]}
            entity={attachments}
            entityKey={index}
          />
        ))}
      </Flex>
    </Flex>
  );
}
