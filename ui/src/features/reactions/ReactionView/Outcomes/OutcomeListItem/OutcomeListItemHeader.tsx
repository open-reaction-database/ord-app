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
import { TitleDelimiterAmount } from 'common/components/display/TitleDelimiterAmount/TitleDelimiterAmount.tsx';
import { FlaskIcon, TimeIcon } from 'common/icons';
import clsx from 'clsx';
import { typographyClasses } from 'common/styling';
import { renderValuePrecisionUnit } from 'features/reactions/ReactionView/renderValuePrecisionUnit.ts';
import type { ReactionOutcome } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.types.ts';
import { useContext } from 'react';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';
import { reactionContext } from 'features/reactions/reactions.context.ts';

interface OutcomeListItemHeaderProps {
  reactionId: ReactionId;
  outcome: ReactionOutcome;
  pathComponents: ReactionPathComponents;
}

export function OutcomeListItemHeader({ outcome, pathComponents }: Readonly<OutcomeListItemHeaderProps>) {
  const { ViewDeleteButtonsComponent } = useContext(reactionContext);
  return (
    <Accordion.Control
      classNames={{ label: classes.label }}
      icon={
        <ViewDeleteButtonsComponent
          entityName="Outcome"
          pathComponents={pathComponents}
        />
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
