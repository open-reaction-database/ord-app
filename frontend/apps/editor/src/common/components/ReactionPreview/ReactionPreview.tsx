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
import type { ReactionOutcome } from '@open-reaction-database/ui/reaction/model';
import { forwardRef, Fragment } from 'react';
import classes from './reactionPreview.module.scss';
import {
  useOrderedInputs,
  useReactionPart,
  useReactionSnapshot,
} from '@open-reaction-database/ui/reaction';
import { ReactionInputPreview } from 'common/components/ReactionPreview/ReactionInputPreview.tsx';
import { ReactionOutcomePreview } from 'common/components/ReactionPreview/ReactionOutcomePreview.tsx';
import { ArrowIcon, EmptyPreview } from '../../icons';
import { Flex, Text, Tooltip } from '@mantine/core';
import { typographyClasses } from '@open-reaction-database/ui/theme';

const NO_OUTCOMES: Array<ReactionOutcome> = [];

interface ReactionPreviewProps {
  /** Shows the reaction's conditions over the arrow. */
  showDetails?: boolean;
}

/** The reaction as inputs, an arrow, and outcomes, each with its molecule previews. */
export const ReactionPreview = forwardRef<
  HTMLDivElement,
  Readonly<ReactionPreviewProps>
>(function ReactionPreview({ showDetails = false }, ref) {
  const inputs = useOrderedInputs();
  const outcomes = useReactionPart<Array<ReactionOutcome>>(['outcomes']) ?? NO_OUTCOMES;
  const conditions = useReactionSnapshot()?.summary.conditions ?? '';

  const hasInputsOrOutcomes = inputs.length > 0 || outcomes.length > 0;

  return hasInputsOrOutcomes ? (
    <div
      className={classes.wrapper}
      ref={ref}
    >
      {inputs.map((input, index) => (
        <Fragment key={input.id}>
          {index > 0 && index < inputs.length && (
            <span className={classes.plus}>+</span>
          )}
          <ReactionInputPreview
            key={input.id}
            inputId={input.id}
          />
        </Fragment>
      ))}
      <Flex
        direction="column"
        className={classes.arrowWrapper}
        justify="center"
      >
        {showDetails && (
          <Tooltip label={conditions}>
            <Text className={classes.arrowText}>{conditions}</Text>
          </Tooltip>
        )}
        <ArrowIcon className={classes.arrow} />
      </Flex>

      {outcomes.map((outcome, index) => (
        <ReactionOutcomePreview
          key={outcome.id}
          outcomeIndex={index}
        />
      ))}
    </div>
  ) : (
    <div className={classes.wrapper}>
      <Flex
        align="center"
        direction="column"
        gap="xs"
        className={classes.emptyPreviewWrapper}
      >
        <EmptyPreview className={classes.emptyPreviewIcon} />
        <Text className={typographyClasses.secondary1}>
          There are no Inputs and Outcomes yet
        </Text>
      </Flex>
    </div>
  );
});
