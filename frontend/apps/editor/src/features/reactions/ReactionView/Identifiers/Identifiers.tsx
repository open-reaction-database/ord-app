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
import { Counter, KeyValueDisplay } from '@open-reaction-database/ui/display';
import { AddCircleIcon } from 'common/icons';
import { create } from '@bufbuild/protobuf';
import { ReactionIdentifierSchema } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { ordReactionIdentifierToReaction } from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import { useCallback } from 'react';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { ReactionIdentifier } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import { ReactionNodeValidationResult } from '../../ReactionInteractions/ReactionNodeValidationResult/ReactionNodeValidationResult.tsx';
import {
  useDrawer,
  useIsViewOnly,
  useReactionActions,
  useReactionPart,
  useReactionSlots,
} from 'features/reactions/provider/reactionProvider.hooks.ts';

const ENTITY_FIELD = 'identifiers';

export function Identifiers() {
  const drawer = useDrawer();
  const actions = useReactionActions();
  const identifiers = useReactionPart<Array<ReactionIdentifier>>([ENTITY_FIELD]) ?? [];
  const isViewOnly = useIsViewOnly();
  const { ViewDeleteButtons } = useReactionSlots();
  const onIdentifierCreate = useCallback(() => {
    const newIdentifierPath: ReactionPathComponents = [
      ENTITY_FIELD,
      identifiers.length,
    ];
    const newIdentifier = ordReactionIdentifierToReaction(
      create(ReactionIdentifierSchema),
    );

    void actions?.update(newIdentifierPath, newIdentifier);
    drawer.set([newIdentifierPath]);
  }, [actions, identifiers.length, drawer]);

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
      <span className={classes.text}>
        Reaction identifiers define descriptions of the overall reaction
      </span>

      <Flex
        direction="column"
        gap="sm"
        key={identifiers.length}
      >
        {identifiers.map((identifier, index) => (
          <div key={identifier.id}>
            <Flex
              align="center"
              className={classes.identifier}
            >
              <span className={classes.identifierLabel}>Identifier {index + 1}</span>
              <ViewDeleteButtons
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
