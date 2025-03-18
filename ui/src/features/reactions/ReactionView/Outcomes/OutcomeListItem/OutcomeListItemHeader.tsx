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
import classes from 'features/reactions/ReactionView/Outcomes/OutcomeListItem/outcomeListItem.module.scss';
import { Accordion, Flex, Text } from '@mantine/core';
import { EditButton } from 'common/components/EditButton/EditButton.tsx';
import { ReactionEntityDelete } from 'features/reactions/ReactionEntities/ReactionEntityDelete/ReactionEntityDelete.tsx';
import { TitleDelimiterAmount } from 'common/components/display/TitleDelimiterAmount/TitleDelimiterAmount.tsx';
import { FlaskIcon, TimeIcon } from 'common/icons';
import clsx from 'clsx';
import { typographyClasses } from 'common/styling';
import { renderValuePrecisionUnit } from 'features/reactions/ReactionView/renderValuePrecisionUnit.ts';
import type { ReactionOutcome } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.types.ts';
import { type MouseEvent, useContext } from 'react';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';
import { templatesContext } from 'features/templates/templates.context';

interface OutcomeListItemHeaderProps {
  reactionId: ReactionId;
  outcome: ReactionOutcome;
  pathComponents: ReactionPathComponents;
}

const onActionClick = (event: MouseEvent) => {
  event.stopPropagation();
};

export function OutcomeListItemHeader({ reactionId, outcome, pathComponents }: Readonly<OutcomeListItemHeaderProps>) {
  const dispatch = useAppDispatch();
  const { isTemplate } = useContext(templatesContext);
  const onEditOutcome = () => {
    dispatch(setReactionPathComponentsList([pathComponents]));
  };
  return (
    <Accordion.Control
      classNames={{ label: classes.label }}
      icon={
        !isTemplate && (
          <Flex
            onClick={onActionClick}
            align="center"
          >
            <EditButton onClick={onEditOutcome} />
            <ReactionEntityDelete
              reactionId={reactionId}
              entityName="Outcome"
              pathComponents={pathComponents}
            />
          </Flex>
        )
      }
    >
      <Flex
        align="center"
        gap="xs"
      >
        <TitleDelimiterAmount
          title="Outcome"
          amount={outcome.products.length}
        />
      </Flex>
      {outcome.reactionTime && outcome.reactionTime.value && (
        <Flex
          align="center"
          gap="xs"
        >
          <TimeIcon className={classes.shortInfoIcon} />
          <Text className={clsx(classes.shortInfoText, typographyClasses.secondary2)}>Time: </Text>
          <Text className={classes.shortInfoText}>{renderValuePrecisionUnit(outcome.reactionTime)}</Text>
        </Flex>
      )}
      {outcome.conversion && outcome.conversion.value && (
        <Flex
          align="center"
          gap="xs"
        >
          <FlaskIcon className={classes.shortInfoIcon} />
          <Text className={clsx(classes.shortInfoText, typographyClasses.secondary2)}>
            Limiting reactant conversion:{' '}
          </Text>
          <Text className={classes.shortInfoText}>
            {renderValuePrecisionUnit({ ...outcome.conversion, units: '' })}
          </Text>
        </Flex>
      )}
      <Flex></Flex>
    </Accordion.Control>
  );
}
