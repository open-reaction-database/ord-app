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
import type { MessageInitShape } from '@bufbuild/protobuf';
import type {
  ReactionNotes as OrdReactionNotes,
  ReactionNotesSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import type { ReactionNotes } from 'store/entities/reactions/reactionNotes/reactionNotes.types.ts';
import {
  ordBooleanToReaction,
  ordScalarToReaction,
  reactionBooleanToOrd,
} from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import type { OrdOptional } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import { convertObjectToUndefinedIfEmpty } from '../reactions.utils.ts';

export const ordNotesToReaction = (
  notes: OrdOptional<OrdReactionNotes>,
): ReactionNotes => ({
  isHeterogeneous: ordBooleanToReaction(notes?.isHeterogeneous),
  formsPrecipitate: ordBooleanToReaction(notes?.formsPrecipitate),
  isExothermic: ordBooleanToReaction(notes?.isExothermic),
  isSensitiveToLight: ordBooleanToReaction(notes?.isSensitiveToLight),
  isSensitiveToMoisture: ordBooleanToReaction(notes?.isSensitiveToMoisture),
  isSensitiveToOxygen: ordBooleanToReaction(notes?.isSensitiveToOxygen),
  offgasses: ordBooleanToReaction(notes?.offgasses),
  procedureDetails: ordScalarToReaction(notes?.procedureDetails),
  safetyNotes: ordScalarToReaction(notes?.safetyNotes),
});

export const reactionNotesToOrd = ({
  isHeterogeneous,
  formsPrecipitate,
  isExothermic,
  isSensitiveToLight,
  isSensitiveToOxygen,
  isSensitiveToMoisture,
  offgasses,
  procedureDetails,
  safetyNotes,
}: ReactionNotes): MessageInitShape<typeof ReactionNotesSchema> | undefined =>
  convertObjectToUndefinedIfEmpty({
    isHeterogeneous: reactionBooleanToOrd(isHeterogeneous),
    formsPrecipitate: reactionBooleanToOrd(formsPrecipitate),
    isExothermic: reactionBooleanToOrd(isExothermic),
    isSensitiveToLight: reactionBooleanToOrd(isSensitiveToLight),
    isSensitiveToMoisture: reactionBooleanToOrd(isSensitiveToMoisture),
    isSensitiveToOxygen: reactionBooleanToOrd(isSensitiveToOxygen),
    offgasses: reactionBooleanToOrd(offgasses),
    procedureDetails: procedureDetails ?? undefined,
    safetyNotes: safetyNotes ?? undefined,
  });
