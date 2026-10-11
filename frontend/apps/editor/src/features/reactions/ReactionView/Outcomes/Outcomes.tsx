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
import { create } from '@bufbuild/protobuf';
import { ReactionOutcomeSchema } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { Accordion, Button, Flex, Title } from '@mantine/core';
import { Counter } from '@open-reaction-database/ui/display';
import { AddCircleIcon, NoData } from 'common/icons';
import { buildUseCreate } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import classes from './outcomes.module.scss';
import { typographyClasses } from '@open-reaction-database/ui/theme';
import {
  type ReactionOutcome,
  ordOutcomeToReactionOutcome,
  sortOutcomesByReactionTime,
} from '@open-reaction-database/ui/reaction/model';
import { OutcomeListItem } from 'features/reactions/ReactionView/Outcomes/OutcomeListItem/OutcomeListItem.tsx';
import { useMemo } from 'react';
import { ReactionNodeValidationResult } from '../../ReactionInteractions/ReactionNodeValidationResult/ReactionNodeValidationResult.tsx';
import { useIsViewOnly, useReactionPart } from '@open-reaction-database/ui/reaction';

const useCreate = buildUseCreate('outcomes', newIndex => [
  newIndex,
  ordOutcomeToReactionOutcome(create(ReactionOutcomeSchema)),
]);

const ENTITY_FIELD = 'outcomes';

const NO_OUTCOMES: Array<ReactionOutcome> = [];

export function Outcomes() {
  const outcomes =
    useReactionPart<Array<ReactionOutcome>>([ENTITY_FIELD]) ?? NO_OUTCOMES;
  const onCreateNew = useCreate();
  const isViewOnly = useIsViewOnly();
  const handleCreate = () => {
    onCreateNew(outcomes.length, outcomes);
  };

  const ids = useMemo(() => outcomes.map(outcome => outcome.id), [outcomes]);
  // Display outcomes ordered by reaction time when available, else stored order. The original
  // stored index is preserved for each so the edit path stays correct. (#599)
  const orderedOutcomes = useMemo(
    () => sortOutcomesByReactionTime(outcomes),
    [outcomes],
  );

  return (
    <Flex direction="column">
      <Flex justify="space-between">
        <Flex
          align="center"
          gap="sm"
        >
          <Title order={2}>Outcomes</Title>
          <Counter amount={outcomes.length} />
          <ReactionNodeValidationResult pathComponents={[ENTITY_FIELD]} />
        </Flex>
        {!isViewOnly && (
          <Button
            onClick={handleCreate}
            leftSection={<AddCircleIcon />}
          >
            Outcome
          </Button>
        )}
      </Flex>
      <span>
        Outcomes record timestamped analyses and, optionally, product characterization
      </span>
      {outcomes.length > 0 ? (
        <Accordion
          variant="separated"
          chevronPosition="left"
          multiple={true}
          className={classes.itemsList}
          defaultValue={ids}
        >
          {orderedOutcomes.map(({ outcome, index }) => (
            <OutcomeListItem
              key={outcome.id}
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
          <span className={typographyClasses.secondary1}>
            There are no Outcomes yet
          </span>
        </Flex>
      )}
    </Flex>
  );
}
