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
import classes from './provenance.module.scss';
import { useSelector } from 'react-redux';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors';
import { formatDateToDisplay } from 'common/utils';
import type { ReactionProvenance } from 'store/entities/reactions/reactionProvenance/reactionProvenance.types.ts';
import { EntityListItem } from '../../ReactionEntities/entityFormConfiguration/EntityListItem/EntityListItem.tsx';
import { RequiredOptionalFields } from 'common/components/display/RequiredOptionalFields/RequiredOptionalFields.tsx';
import { OpenSingleEntityButton } from '../OpenSingleEntityButton/OpenSingleEntityButton.tsx';
import { useContext } from 'react';
import { reactionContext } from '../../reactions.context.ts';

const ENTITY_FIELD = 'provenance';

export function Provenance() {
  const { reactionId } = useContext(reactionContext);
  const provenance: ReactionProvenance = useSelector(selectReactionPartByPath(reactionId, [ENTITY_FIELD]));

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
          <Title order={2}>Provenance</Title>
        </Flex>
        <OpenSingleEntityButton pathComponents={[ENTITY_FIELD]} />
      </Flex>
      <span className={classes.text}>
        Additional metadata about how this reaction was performed and originally reported
      </span>

      <Flex
        direction="column"
        gap="sm"
        className={classes.mainInformation}
      >
        <span className={classes.provenanceLabel}>Experiment</span>
        <RequiredOptionalFields
          entity={provenance.experimenter}
          requiredFields={[
            { label: 'Experimenter name', render: experimenter => experimenter.name },
            { label: 'E-mail', render: experimenter => experimenter.email },
            { label: 'ORCID ID', render: experimenter => experimenter.orcid },
            { label: 'Username', render: experimenter => experimenter.username },
          ]}
        />

        <span className={classes.provenanceLabel}>Record Creation</span>
        <RequiredOptionalFields
          entity={provenance.recordCreated}
          requiredFields={[
            { label: 'Time', render: ({ time }) => (time ? formatDateToDisplay(time) : '') },
            { label: 'E-mail', render: ({ person }) => person.email },
            { label: 'ORCID ID', render: ({ person }) => person.orcid },
            { label: 'Username', render: ({ person }) => person.username },
            { label: 'Experimenter name', render: ({ person }) => person.name },
          ]}
        />
      </Flex>

      <Flex
        direction="column"
        gap="sm"
      >
        {provenance.recordModified.map((recordModification, index) => (
          <EntityListItem
            key={recordModification.id}
            historyPathComponents={[[ENTITY_FIELD]]}
            entityField={[ENTITY_FIELD, 'recordModified']}
            title="Record Modification"
            requiredFields={[
              { label: 'Time', render: ({ time }) => (time ? formatDateToDisplay(time) : '') },
              { label: 'Person Email', render: ({ person }) => person.email },
              { label: 'Details', render: ({ details }) => details },
            ]}
            entity={recordModification}
            entityKey={index}
          />
        ))}
      </Flex>
    </Flex>
  );
}
