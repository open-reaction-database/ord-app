/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { ReactionOutcome } from './reactionOutcomes.types.ts';
import type { ReactionTime } from '../reactionEntity/reactionEntity.types.ts';
import type { ReactionTimeType } from '../reactionEntityTypes/reactionEntityTypes.types.ts';

// Reaction-time units normalized to seconds so outcomes recorded in different units sort correctly.
// `satisfies` makes this exhaustive at compile time: every non-UNSPECIFIED `ord.Time.TimeUnit`
// must have a factor here, so adding a unit to the schema (e.g. WEEK) breaks the build until mapped.
const TIME_UNIT_TO_SECONDS = {
  DAY: 86_400,
  HOUR: 3_600,
  MINUTE: 60,
  SECOND: 1,
} satisfies Record<Exclude<ReactionTimeType, 'UNSPECIFIED'>, number>;

/** A reaction time normalized to seconds, or undefined when it has no usable value/unit. */
function reactionTimeInSeconds(time: ReactionTime | undefined): number | undefined {
  const unitSeconds = time?.units
    ? (TIME_UNIT_TO_SECONDS as Record<string, number | undefined>)[time.units]
    : undefined;
  if (time?.value == null || unitSeconds === undefined) return undefined;
  return time.value * unitSeconds;
}

/**
 * Order outcomes for display by reaction time (ascending) when available, otherwise keep their
 * stored order. (#599)
 *
 * Outcomes without a usable reaction time retain their stored order and follow the timed ones;
 * ties break on stored order. Stable and non-mutating — each outcome is returned with its original
 * stored index so the edit path (`['outcomes', index]`) stays correct regardless of display order.
 */
export function sortOutcomesByReactionTime(
  outcomes: Array<ReactionOutcome>,
): Array<{ outcome: ReactionOutcome; index: number }> {
  return outcomes
    .map((outcome, index) => ({
      outcome,
      index,
      seconds: reactionTimeInSeconds(outcome.reactionTime),
    }))
    .sort((a, b) => {
      if (a.seconds === undefined && b.seconds === undefined) return a.index - b.index;
      if (a.seconds === undefined) return 1;
      if (b.seconds === undefined) return -1;
      return a.seconds - b.seconds || a.index - b.index;
    })
    .map(({ outcome, index }) => ({ outcome, index }));
}
