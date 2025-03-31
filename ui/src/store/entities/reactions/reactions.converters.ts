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
import type { ord } from 'ord-schema-protobufjs';
import {
  ordInputsToReactionInputs,
  reactionInputsToOrdInputs,
} from 'store/entities/reactions/reactionsInputs/reactionsInputs.converters.ts';
import {
  linkReactionOutcome,
  ordOutcomesListToReactionOutcomesList,
  reactionOutcomesListToOrdOutcomesList,
} from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.converters.ts';
import {
  ordReactionIdentifierToReaction,
  reactionIdentifierToOrd,
} from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import {
  ordNotesToReaction,
  reactionNotesToOrd,
} from 'store/entities/reactions/reactionNotes/reactionNotes.converters.ts';
import type { AppReaction } from 'store/entities/reactions/reactions.types.ts';
import {
  ordObservationToReactionObservation,
  reactionObservationToOrdObservation,
} from './reactionObservation/reactionObservation.converter';

export function ordReactionToReaction(reaction: ord.IReaction): AppReaction {
  return {
    ...reaction,
    inputs: ordInputsToReactionInputs(reaction.inputs),
    outcomes: ordOutcomesListToReactionOutcomesList(reaction.outcomes || []),
    identifiers: (reaction.identifiers || []).map(ordReactionIdentifierToReaction),
    observations: (reaction.observations || []).map(ordObservationToReactionObservation),
    notes: ordNotesToReaction(reaction.notes),
  };
}

export function reactionToOrdReaction(reaction: AppReaction): ord.IReaction {
  return {
    ...reaction,
    inputs: reactionInputsToOrdInputs(reaction.inputs),
    outcomes: reactionOutcomesListToOrdOutcomesList(reaction.outcomes),
    identifiers: reaction.identifiers.map(reactionIdentifierToOrd),
    observations: reaction.observations.map(reactionObservationToOrdObservation),
    notes: reactionNotesToOrd(reaction.notes),
  };
}

export function linkReactionEntities(reaction: AppReaction): AppReaction {
  return {
    ...reaction,
    outcomes: reaction.outcomes.map(linkReactionOutcome),
  };
}

const PRECISION = 7;

// Since ord-schema uses floats instead of doubles for all numbers we have to patch all the numbers to try to restore user's input
// Accuracy is not guaranteed
// Original issue
// https://github.com/open-reaction-database/ord-interface/blob/main/ord_interface/editor/js/utils.js#L397
export function convertReactionFloatsToDoubles(reactionPart: unknown): void {
  if (typeof reactionPart !== 'object' || reactionPart === null) {
    return;
  }

  if (Array.isArray(reactionPart)) {
    reactionPart.forEach(item => convertReactionFloatsToDoubles(item));
  } else {
    Object.keys(reactionPart).forEach(key => {
      const dynamicReactionPart = reactionPart as Record<string, unknown>;
      const value = dynamicReactionPart[key];
      if (typeof value === 'object') {
        convertReactionFloatsToDoubles(value);
      } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          dynamicReactionPart[key] = parseInt(value.toString(), 10);
        } else {
          dynamicReactionPart[key] = parseFloat(value.toPrecision(PRECISION));
        }
      }
    });
  }
}
