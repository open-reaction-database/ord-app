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
import { useSelector } from 'react-redux';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors.ts';
import type { ord } from 'ord-schema-protobufjs';
import { Fragment, useMemo, useContext } from 'react';
import classes from 'features/reactions/ReactionView/Notes/notes.module.scss';
import { typographyClasses } from 'common/styling';
import type { ReactionNotes } from 'store/entities/reactions/reactionNotes/reactionNotes.types.ts';
import { ReactionBoolean } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import { reactionContext } from '../../reactions.context.ts';
import { OpenSingleEntityButton } from '../OpenSingleEntityButton/OpenSingleEntityButton.tsx';
import { ReactionNodeValidationResult } from '../../ReactionInteractions/ReactionNodeValidationResult/ReactionNodeValidationResult.tsx';

const notesFields: Array<[keyof ord.IReactionNotes, string]> = [
  ['procedureDetails', 'Procedure details'],
  ['safetyNotes', 'Safety notes'],
  ['isHeterogeneous', 'Is heterogeneous'],
  ['formsPrecipitate', 'Forms precipitate'],
  ['isExothermic', 'Is exothermic'],
  ['offgasses', 'Offgasses'],
  ['isSensitiveToOxygen', 'Oxygen sensitive'],
  ['isSensitiveToMoisture', 'Moisture sensitive'],
  ['isSensitiveToLight', 'Light sensitive'],
];

type ValueType = ReactionNotes[keyof ReactionNotes];
type NotEmptyValueType = Exclude<ValueType, null | undefined>;

const ENTITY_FIELD = 'notes';

export function Notes() {
  const { reactionId } = useContext(reactionContext);
  const notesOrNull = useSelector(selectReactionPartByPath(reactionId, [ENTITY_FIELD]));
  const fields = useMemo((): Array<[string, string]> => {
    const notes: ReactionNotes = notesOrNull || {};
    return notesFields
      .map(([key, label]): [string, ValueType] => [label, notes[key]])
      .filter(([, value]) => value && value !== ReactionBoolean.Unspecified) as Array<[string, NotEmptyValueType]>;
  }, [notesOrNull]);

  return (
    <Flex
      direction="column"
      gap="md"
    >
      <Flex justify="space-between">
        <Flex
          align="center"
          gap="sm"
        >
          <Title order={2}>Notes</Title>
          <ReactionNodeValidationResult pathComponents={[ENTITY_FIELD]} />
        </Flex>
        <OpenSingleEntityButton pathComponents={[ENTITY_FIELD]} />
      </Flex>
      <div className={classes.grid}>
        {fields.map(([label, value]) => (
          <Fragment key={label}>
            <span className={typographyClasses.secondary2}>{label}</span>
            <p>{value.toString()}</p>
          </Fragment>
        ))}
      </div>
    </Flex>
  );
}
