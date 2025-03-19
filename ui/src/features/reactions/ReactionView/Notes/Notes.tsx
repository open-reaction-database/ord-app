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
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions.ts';
import type { ReactionViewSectionProps } from 'features/reactions/ReactionView/reactionView.types.ts';
import { useSelector } from 'react-redux';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors.ts';
import type { ord } from 'ord-schema-protobufjs';
import { Fragment, useMemo, useContext } from 'react';
import classes from 'features/reactions/ReactionView/Notes/notes.module.scss';
import { typographyClasses } from 'common/styling';
import type { ReactionNotes } from 'store/entities/reactions/reactionNotes/reactionNotes.types.ts';
import { ReactionBoolean } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import { templatesContext } from 'features/templates/templates.context';

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

export function Notes({ reactionId }: Readonly<ReactionViewSectionProps>) {
  const dispatch = useAppDispatch();
  const notes: ReactionNotes = useSelector(selectReactionPartByPath(reactionId, ['notes'])) || {};
  const { isTemplate } = useContext(templatesContext);
  const fields = useMemo((): Array<[string, string]> => {
    return notesFields
      .map(([key, label]): [string, ValueType] => [label, notes[key]])
      .filter(([, value]) => value && value !== ReactionBoolean.Unspecified) as Array<[string, NotEmptyValueType]>;
  }, [notes]);

  const onEdit = () => {
    dispatch(setReactionPathComponentsList([['notes']]));
  };

  return (
    <Flex
      direction="column"
      gap="md"
    >
      <Flex justify="space-between">
        <Title order={2}>Notes</Title>
        {!isTemplate && (
          <Button
            onClick={onEdit}
            leftSection={<AddCircleIcon />}
          >
            Edit
          </Button>
        )}
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
