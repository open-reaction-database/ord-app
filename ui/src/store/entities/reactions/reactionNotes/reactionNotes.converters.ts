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
import type { ReactionNotes } from 'store/entities/reactions/reactionNotes/reactionNotes.types.ts';
import {
  ordBooleanToReaction,
  reactionBooleanToOrd,
} from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import type { Optional, OrdOptional } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import { convertObjectToNullIfEmpty } from '../reactions.utils.ts';

export const ordNotesToReaction = (notes: OrdOptional<ord.IReactionNotes>): ReactionNotes => {
  const {
    isHeterogeneous,
    formsPrecipitate,
    isExothermic,
    isSensitiveToLight,
    isSensitiveToOxygen,
    isSensitiveToMoisture,
    offgasses,
    ...rest
  } = notes ?? {};

  return {
    isHeterogeneous: ordBooleanToReaction(isHeterogeneous),
    formsPrecipitate: ordBooleanToReaction(formsPrecipitate),
    isExothermic: ordBooleanToReaction(isExothermic),
    isSensitiveToLight: ordBooleanToReaction(isSensitiveToLight),
    isSensitiveToMoisture: ordBooleanToReaction(isSensitiveToMoisture),
    isSensitiveToOxygen: ordBooleanToReaction(isSensitiveToOxygen),
    offgasses: ordBooleanToReaction(offgasses),
    ...rest,
  };
};

export const reactionNotesToOrd = ({
  isHeterogeneous,
  formsPrecipitate,
  isExothermic,
  isSensitiveToLight,
  isSensitiveToOxygen,
  isSensitiveToMoisture,
  offgasses,
  ...rest
}: ReactionNotes): Optional<ord.IReactionNotes> =>
  convertObjectToNullIfEmpty({
    isHeterogeneous: reactionBooleanToOrd(isHeterogeneous),
    formsPrecipitate: reactionBooleanToOrd(formsPrecipitate),
    isExothermic: reactionBooleanToOrd(isExothermic),
    isSensitiveToLight: reactionBooleanToOrd(isSensitiveToLight),
    isSensitiveToMoisture: reactionBooleanToOrd(isSensitiveToMoisture),
    isSensitiveToOxygen: reactionBooleanToOrd(isSensitiveToOxygen),
    offgasses: reactionBooleanToOrd(offgasses),
    ...rest,
  });
