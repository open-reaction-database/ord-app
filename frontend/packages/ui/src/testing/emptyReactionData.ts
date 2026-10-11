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
import { ordSetupToReactionSetup } from '#reaction/model/reactionSetup/reactionSetup.converter.ts';
import { ordConditionsToReaction } from '#reaction/model/reactionConditions/reactionConditions.converter.ts';
import { ordNotesToReaction } from '#reaction/model/reactionNotes/reactionNotes.converters.ts';
import { ordProvenanceToReaction } from '#reaction/model/reactionProvenance/reactionProvenance.converters.ts';
import type { AppReaction } from '#reaction/model/reactions.types.ts';

/** A structurally-valid empty reaction, built from the same default converters the app uses. */
export function emptyReactionData(): AppReaction {
  return {
    reactionId: '',
    inputs: {},
    outcomes: [],
    identifiers: [],
    setup: ordSetupToReactionSetup(null),
    observations: [],
    conditions: ordConditionsToReaction(null),
    notes: ordNotesToReaction(null),
    provenance: ordProvenanceToReaction(null),
    workups: [],
  } as unknown as AppReaction;
}
