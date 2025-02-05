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
import { useAppDispatch } from 'store/useAppDispatch';
import { setReactionPathComponentsList } from 'store/reactionForm/reactionForm.actions';
import type { ReactionSectionProps } from '../reactionPage.types';
import { useSelector } from 'react-redux';
import { selectReactionById } from 'store/reactions/reactions.selectors';
import type reactionSchema from 'ord-schema/proto/reaction_pb';
import { Fragment, useMemo } from 'react';
import classes from './notes.module.scss';
import { typographyClasses } from '../../../common/styling';

const notesFields: Array<[keyof reactionSchema.ReactionNotes.AsObject, string]> = [
  ['procedureDetails', 'Procedure details'],
  ['safetyNotes', 'Safety notes'],
  ['isHeterogeneous', 'Is Heterogeneous'],
  ['formsPrecipitate', 'Forms precipitate'],
  ['isExothermic', 'Is Exothermic'],
  ['offgasses', 'Offgasses'],
  ['isSensitiveToOxygen', 'Oxygen sensitive'],
  ['isSensitiveToMoisture', 'Moisture sensitive'],
  ['isSensitiveToLight', 'Light sensitive'],
];

const booleanToUppercase = (value: boolean | string): string =>
  typeof value === 'boolean' ? value.toString().toUpperCase() : value;

export function Notes({ reactionId }: Readonly<ReactionSectionProps>) {
  const dispatch = useAppDispatch();
  const { data: reaction } = useSelector(selectReactionById(reactionId));

  const fields = useMemo((): Array<[string, string]> => {
    const notes = reaction.notes || ({} as reactionSchema.ReactionNotes.AsObject);
    return notesFields
      .map(([key, label]): [string, string | boolean] => [label, notes[key]])
      .filter(([, value]) => typeof value !== 'undefined' && value !== null && value !== '')
      .map(([label, value]) => [label, booleanToUppercase(value)]);
  }, [reaction.notes]);

  const onEdit = () => {
    dispatch(setReactionPathComponentsList([['notes']]));
  };

  return (
    <>
      <Flex
        direction="column"
        gap="md"
      >
        <Flex justify="space-between">
          <Title order={2}>Notes</Title>
          <Button
            onClick={onEdit}
            leftSection={<AddCircleIcon />}
          >
            Edit
          </Button>
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
    </>
  );
}
