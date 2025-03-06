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
  ordBooleanToReactionBoolean,
  reactionBooleanToOrdBoolean,
} from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import type { OrdOptional } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';

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
    isHeterogeneous: ordBooleanToReactionBoolean(isHeterogeneous),
    formsPrecipitate: ordBooleanToReactionBoolean(formsPrecipitate),
    isExothermic: ordBooleanToReactionBoolean(isExothermic),
    isSensitiveToLight: ordBooleanToReactionBoolean(isSensitiveToLight),
    isSensitiveToMoisture: ordBooleanToReactionBoolean(isSensitiveToMoisture),
    isSensitiveToOxygen: ordBooleanToReactionBoolean(isSensitiveToOxygen),
    offgasses: ordBooleanToReactionBoolean(offgasses),
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
}: ReactionNotes): ord.IReactionNotes => ({
  isHeterogeneous: reactionBooleanToOrdBoolean(isHeterogeneous),
  formsPrecipitate: reactionBooleanToOrdBoolean(formsPrecipitate),
  isExothermic: reactionBooleanToOrdBoolean(isExothermic),
  isSensitiveToLight: reactionBooleanToOrdBoolean(isSensitiveToLight),
  isSensitiveToMoisture: reactionBooleanToOrdBoolean(isSensitiveToMoisture),
  isSensitiveToOxygen: reactionBooleanToOrdBoolean(isSensitiveToOxygen),
  offgasses: reactionBooleanToOrdBoolean(offgasses),
  ...rest,
});
