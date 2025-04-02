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
import classes from './provenance.module.scss';
import type { ReactionViewSectionProps } from 'features/reactions/ReactionView/reactionView.types';
import { useSelector } from 'react-redux';
import { EditIcon } from 'common/icons';
import { useAppDispatch } from 'store/useAppDispatch';
import { useContext, type ReactNode } from 'react';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions';
import { KeyValueDisplay } from 'common/components/display/KeyValueDisplay/KeyValueDisplay';
import { reactionContext } from '../../reactions.context';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors';
import { formatDate } from 'common/utils';
import { getDeepReactionPart } from 'store/entities/reactions/reactions.utils.ts';
import type { ReactionProvenance } from 'store/entities/reactions/reactionProvenance/reactionProvenance.types.ts';
import { EntityListItem } from '../../ReactionEntities/entityFormConfiguration/EntityListItem/EntityListItem.tsx';

const ENTITY_FIELD = 'provenance';

const PROVENANCE_FIELDS = {
  experimenter: [
    { label: 'Experimenter name', key: 'name' },
    { label: 'E-mail', key: 'email' },
    { label: 'ORCID ID', key: 'orcid' },
    { label: 'Username', key: 'username' },
  ],
  recordCreated: [
    { label: 'Time', key: 'time.value', format: (value: string) => formatDate(value) },
    { label: 'E-mail', key: 'person.email' },
    { label: 'ORCID ID', key: 'person.orcid' },
    { label: 'Username', key: 'person.username' },
    { label: 'Experimenter name', key: 'person.name' },
  ],
};

interface Field {
  label: string;
  key: string;
  format?: (value: string) => string;
  multiline?: boolean;
}

const renderKeyValueSection = (fields: Array<Field>, data?: object | null) => (
  <>
    {fields.map(({ label, key, format, multiline }) => {
      const value = getDeepReactionPart(data || {}, key.split('.'));
      return (
        <KeyValueDisplay
          key={`${label}-${key}`}
          label={label}
          value={format ? format(value) : (value as ReactNode)}
          multiline={multiline}
        />
      );
    })}
  </>
);

export function Provenance({ reactionId }: ReactionViewSectionProps) {
  const dispatch = useAppDispatch();
  const provenance: ReactionProvenance = useSelector(selectReactionPartByPath(reactionId, [ENTITY_FIELD]));
  const { isViewOnly } = useContext(reactionContext);

  const onEdit = () => dispatch(setReactionPathComponentsList([[ENTITY_FIELD]]));

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
        {!isViewOnly && (
          <Button
            onClick={onEdit}
            leftSection={
              <EditIcon
                width={16}
                height={16}
              />
            }
          >
            Edit
          </Button>
        )}
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
        {renderKeyValueSection(PROVENANCE_FIELDS.experimenter, provenance.experimenter)}

        <span className={classes.provenanceLabel}>Record Creation</span>
        {renderKeyValueSection(PROVENANCE_FIELDS.recordCreated, provenance.recordCreated)}
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
              { label: 'Time', render: ({ time }) => (time ? formatDate(time) : '') },
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
