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
import { useContext } from 'react';
import { reactionContext } from '../../reactions.context.ts';
import { Button, Flex, Title } from '@mantine/core';
import { Counter } from 'common/components/display/Counter/Counter.tsx';
import { useSelector } from 'react-redux';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors.ts';
import { AddCircleIcon } from 'common/icons';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import { ord } from 'ord-schema-protobufjs';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { EntityListItem } from '../../ReactionEntities/entityFormConfiguration/EntityListItem/EntityListItem.tsx';
import { ordWorkupToReaction } from 'store/entities/reactions/reactionWorkups/reactionWorkups.converters.ts';
import type { ReactionWorkup } from 'store/entities/reactions/reactionWorkups/reactionWorkups.types.ts';

const ENTITY_FIELD = 'workups';

export function Workups() {
  const dispatch = useAppDispatch();
  const { isViewOnly, reactionId } = useContext(reactionContext);
  const workups: Array<ReactionWorkup> = useSelector(selectReactionPartByPath(reactionId, [ENTITY_FIELD]));

  const onWorkupCreate = () => {
    const newIdentifierPath: ReactionPathComponents = [ENTITY_FIELD, workups.length];
    const newWorkup = ordWorkupToReaction(ord.ReactionWorkup.toObject(new ord.ReactionWorkup()));

    dispatch(addUpdateReactionField({ reactionId, pathComponents: newIdentifierPath, newValue: newWorkup }));
    dispatch(setReactionPathComponentsList([newIdentifierPath]));
  };

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
          <Title order={2}>Workups</Title>
          <Counter amount={workups.length} />
        </Flex>
        {!isViewOnly && (
          <Button
            onClick={onWorkupCreate}
            leftSection={<AddCircleIcon />}
          >
            Workup
          </Button>
        )}
      </Flex>
      <span>
        Workup steps refer to any additions, purifications, or other operations after the ‘reaction’ stage prior to
        analysis
      </span>
      <Flex
        direction="column"
        gap="sm"
      >
        {workups.map((workup, index) => (
          <EntityListItem
            key={workup.id}
            entityField={ENTITY_FIELD}
            title="Workup"
            requiredFields={[]}
            entityKey={index}
            entity={workup}
          />
        ))}
      </Flex>
    </Flex>
  );
}
