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
import classes from './identifiers.module.scss';
import { Counter } from 'common/components/display/Counter/Counter.tsx';
import type { ReactionViewSectionProps } from 'features/reactions/ReactionView/reactionView.types.ts';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { useSelector } from 'react-redux';
import { AddCircleIcon } from 'common/icons';
import { ord } from 'ord-schema-protobufjs';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { useCallback, useContext } from 'react';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions.ts';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import { KeyValueDisplay } from 'common/components/display/KeyValueDisplay/KeyValueDisplay';
import { reactionContext } from '../../reactions.context.ts';
import { ReactionNodeValidationResult } from '../../ReactionInteractions/ReactionNodeValidationResult/ReactionNodeValidationResult.tsx';

const ENTITY_FIELD = 'identifiers';

export function Identifiers({ reactionId }: ReactionViewSectionProps) {
  const dispatch = useAppDispatch();
  const reaction = useSelector(selectReactionById(reactionId));
  const identifiers = reaction.data.identifiers || [];
  const onIdentifierCreate = useCallback(() => {
    const newIdentifierPath: ReactionPathComponents = [ENTITY_FIELD, identifiers.length];
    const newIdentifier = ord.ReactionIdentifier.toObject(new ord.ReactionIdentifier());

    dispatch(addUpdateReactionField({ reactionId, pathComponents: newIdentifierPath, newValue: newIdentifier }));
    dispatch(setReactionPathComponentsList([newIdentifierPath]));
  }, [reactionId, identifiers.length, dispatch]);

  const { ViewDeleteButtonsComponent, isViewOnly } = useContext(reactionContext);

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
          <Title order={2}>Identifiers</Title>
          <Counter amount={identifiers.length} />
          <ReactionNodeValidationResult pathComponents={[ENTITY_FIELD]} />
        </Flex>
        {!isViewOnly && (
          <Button
            onClick={onIdentifierCreate}
            leftSection={<AddCircleIcon />}
          >
            Identifier
          </Button>
        )}
      </Flex>
      <span className={classes.text}>Reaction identifiers define descriptions of the overall reaction</span>

      <Flex
        direction="column"
        gap="sm"
        key={identifiers.length}
      >
        {identifiers.map((identifier, index) => (
          <div key={index}>
            <Flex
              align="center"
              className={classes.identifier}
            >
              <span className={classes.identifierLabel}>Identifier {index + 1}</span>
              <ViewDeleteButtonsComponent
                entityName="Identifier"
                pathComponents={[ENTITY_FIELD, index]}
              />
            </Flex>

            <KeyValueDisplay
              label={identifier.type}
              value={identifier.value}
              multiline
            />
            <KeyValueDisplay
              label="Details"
              value={identifier.details}
              multiline
            />
          </div>
        ))}
      </Flex>
    </Flex>
  );
}
