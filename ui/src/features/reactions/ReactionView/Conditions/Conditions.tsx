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
import { reactionContext } from 'features/reactions/reactions.context';
import { useContext } from 'react';
import { useSelector } from 'react-redux';
import type { ReactionConditions } from 'store/entities/reactions/reactionConditions/reactionConditions.converter';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions';
import { useAppDispatch } from 'store/useAppDispatch';
import type { ReactionViewSectionProps } from '../reactionView.types';
import { renderValuePrecisionUnit } from '../renderValuePrecisionUnit';

export const ENTITY_FIELD = 'conditions';

export function Conditions({ reactionId }: ReactionViewSectionProps) {
  const dispatch = useAppDispatch();
  const conditions: ReactionConditions = useSelector(selectReactionPartByPath(reactionId, [ENTITY_FIELD]));
  console.log(conditions.temperature);

  const { isViewOnly } = useContext(reactionContext);

  const onEdit = () => dispatch(setReactionPathComponentsList([[ENTITY_FIELD]]));

  return (
    <Flex direction="column">
      <Flex justify="space-between">
        <Flex
          align="center"
          gap="sm"
        >
          <Title order={2}>Conditions</Title>
        </Flex>
        {!isViewOnly && (
          <Button
            onClick={onEdit}
            leftSection={<AddCircleIcon />}
          >
            Conditions
          </Button>
        )}
      </Flex>
      <Flex
        direction="column"
        gap="sm"
      >
        <div>
          <div>Details: {conditions.details}</div>
          <div>Reflux: {conditions.reflux}</div>
          <div>pH: {conditions.ph}</div>
          <div>
            Temperature: {conditions.temperature?.value ? renderValuePrecisionUnit(conditions.temperature) : ''}
          </div>
        </div>
      </Flex>
    </Flex>
  );
}
