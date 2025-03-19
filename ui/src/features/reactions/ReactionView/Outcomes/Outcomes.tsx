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
import type { ReactionViewSectionProps } from 'features/reactions/ReactionView/reactionView.types.ts';
import { useSelector } from 'react-redux';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors.ts';
import { ord } from 'ord-schema-protobufjs';
import { Accordion, Button, Flex, Title } from '@mantine/core';
import { Counter } from 'common/components/display/Counter/Counter.tsx';
import { AddCircleIcon, NoData } from 'common/icons';
import { buildUseCreate } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import classes from './outcomes.module.scss';
import { typographyClasses } from 'common/styling';
import type { ReactionOutcome } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.types.ts';
import { ordOutcomeToReactionOutcome } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.converters.ts';
import { OutcomeListItem } from 'features/reactions/ReactionView/Outcomes/OutcomeListItem/OutcomeListItem.tsx';
import { useMemo, useContext } from 'react';
import { templatesContext } from 'features/templates/templates.context';

const useCreate = buildUseCreate('outcomes', newIndex => [
  newIndex,
  ordOutcomeToReactionOutcome(ord.ReactionOutcome.toObject(new ord.ReactionOutcome())),
]);

const ENTITY_NAME = 'outcomes';

export function Outcomes({ reactionId }: ReactionViewSectionProps) {
  const outcomes: Array<ReactionOutcome> = useSelector(selectReactionPartByPath(reactionId, [ENTITY_NAME]));
  const onCreateNew = useCreate();
  const { isTemplate } = useContext(templatesContext);
  const handleCreate = () => {
    onCreateNew(outcomes.length, outcomes);
  };

  const ids = useMemo(() => outcomes?.map(outcome => outcome.id), [outcomes]);

  return (
    <Flex direction="column">
      <Flex justify="space-between">
        <Flex
          align="center"
          gap="sm"
        >
          <Title order={2}>Outcomes</Title>
          <Counter amount={outcomes?.length} />
        </Flex>
        {!isTemplate && (
          <Button
            onClick={handleCreate}
            leftSection={<AddCircleIcon />}
          >
            Outcome
          </Button>
        )}
      </Flex>
      <span>Outcomes record timestamped analyses and, optionally, product characterization</span>
      {outcomes?.length > 0 ? (
        <Accordion
          variant="separated"
          chevronPosition="left"
          multiple={true}
          className={classes.itemsList}
          defaultValue={ids}
        >
          {outcomes.map((outcome, index) => (
            <OutcomeListItem
              key={outcome.id}
              reactionId={reactionId}
              outcome={outcome}
              outcomeIndex={index}
            />
          ))}
        </Accordion>
      ) : (
        <Flex
          direction="column"
          align="center"
          gap="sm"
        >
          <NoData className={classes.icon} />
          <span className={typographyClasses.secondary1}>There are no Outcomes yet</span>
        </Flex>
      )}
    </Flex>
  );
}
