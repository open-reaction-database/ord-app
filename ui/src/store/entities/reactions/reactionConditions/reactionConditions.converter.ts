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
import { ord } from 'ord-schema-protobufjs';
import {
  ordBooleanToReaction,
  ordTemperatureToReaction,
  reactionBooleanToOrd,
  reactionTemperatureToOrd,
  withId,
} from '../reactionEntity/reactionEntity.converters';
import type { OrdOptional, ReactionBoolean, ReactionTemperature } from '../reactionEntity/reactionEntity.types';

export interface ReactionConditions
  extends Omit<ord.IReactionConditions, 'reflux' | 'conditionsAreDynamic' | 'temperature'> {
  id: string;
  reflux: ReactionBoolean;
  conditionsAreDynamic: ReactionBoolean;
  temperature: ReactionTemperature;
}

export const ordConditionsToReactionConditions = (
  conditions: OrdOptional<ord.IReactionConditions>,
): ReactionConditions => {
  const { conditionsAreDynamic, reflux, temperature, ...rest } =
    conditions ?? ord.ReactionConditions.toObject(new ord.ReactionConditions());
  return withId({
    reflux: ordBooleanToReaction(reflux),
    conditionsAreDynamic: ordBooleanToReaction(conditionsAreDynamic),
    temperature: temperature?.setpoint
      ? ordTemperatureToReaction(temperature.setpoint)
      : ordTemperatureToReaction(null),
    ...rest,
  });
};

export const reactionConditionsToOrdConditions = (conditions: ReactionConditions): ord.IReactionConditions => {
  return {
    details: conditions.details,
    ph: conditions.ph,
    reflux: reactionBooleanToOrd(conditions.reflux),
    conditionsAreDynamic: reactionBooleanToOrd(conditions.conditionsAreDynamic),
    temperature: {
      setpoint: reactionTemperatureToOrd(conditions.temperature),
    },
  };
};
