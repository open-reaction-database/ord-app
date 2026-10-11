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
import { RequiredOptionalFields } from '#display/RequiredOptionalFields/RequiredOptionalFields.tsx';
import type { ReactionSetup } from '#reaction/model/reactionSetup/reactionSetup.types.ts';
import type { AppData } from '#reaction/model/reactionData/reactionData.types.ts';
import { EntityListItem } from '#reaction/view/ReactionEntities/entityFormConfiguration/EntityListItem/EntityListItem.tsx';
import { OpenSingleEntityButton } from '#reaction/view/ReactionView/OpenSingleEntityButton/OpenSingleEntityButton.tsx';
import { AppDataDisplay } from '#reaction/view/ReactionEntities/entityFormConfiguration/AppDataDisplay.tsx';
import { ReactionNodeValidationResult } from '#reaction/view/ReactionInteractions/ReactionNodeValidationResult/ReactionNodeValidationResult.tsx';
import { useReactionPart } from '#reaction/provider/reactionProvider.hooks.ts';

const ENTITY_FIELD = 'setup';

export function Setup() {
  const setup = useReactionPart<ReactionSetup>([ENTITY_FIELD])!;

  return (
    <Flex direction="column">
      <Flex justify="space-between">
        <Flex
          align="center"
          gap="sm"
        >
          <Title order={2}>Setup</Title>
          <ReactionNodeValidationResult pathComponents={[ENTITY_FIELD]} />
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
        {Object.values(setup.automationCode).map(automationCode => (
          <EntityListItem
            key={automationCode.id}
            historyPathComponents={[[ENTITY_FIELD]]}
            entityField={[ENTITY_FIELD, 'automationCode']}
            title={item => `Automation Code ${item.name}`}
            requiredFields={[
              { label: 'Type', render: (entity: AppData) => entity.data.type },
              {
                label: 'Value',
                render: (entity: AppData) => <AppDataDisplay appData={entity} />,
              },
              { label: 'Description', render: (entity: AppData) => entity.description },
            ]}
            entity={automationCode}
            entityKey={automationCode.id}
          />
        ))}
        {setup.vessel.vesselPreparations.map((preparation, index) => (
          <EntityListItem
            key={preparation.id}
            historyPathComponents={[[ENTITY_FIELD]]}
            entityField={[ENTITY_FIELD, 'vessel', 'vesselPreparations']}
            title="Vessel Preparation"
            requiredFields={[
              { label: 'Type', render: ({ type }) => type },
              { label: 'Details', render: ({ details }) => details },
            ]}
            entity={preparation}
            entityKey={index}
          />
        ))}
        {setup.vessel.vesselAttachments.map((attachment, index) => (
          <EntityListItem
            key={attachment.id}
            historyPathComponents={[[ENTITY_FIELD]]}
            entityField={[ENTITY_FIELD, 'vessel', 'vesselAttachments']}
            title="Vessel Attachments"
            requiredFields={[
              { label: 'Type', render: ({ type }) => type },
              { label: 'Details', render: ({ details }) => details },
            ]}
            entity={attachment}
            entityKey={index}
          />
        ))}
      </Flex>
    </Flex>
  );
}
