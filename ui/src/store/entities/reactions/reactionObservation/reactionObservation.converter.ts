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
import { ordDataToReaction, reactionDataToOrd } from '../reactionData/reactionData.converters';
import type { AppData } from '../reactionData/reactionData.types';
import { ordTimeToReaction, reactionTimeToOrd, withId } from '../reactionEntity/reactionEntity.converters';
import type { ReactionTime } from '../reactionEntity/reactionEntity.types';

export interface ReactionObservation {
  id: string;
  comment: string;
  time: ReactionTime;
  image: AppData;
  description?: string;
}

export const ordObservationToReaction = (observation: ord.IReactionObservation): ReactionObservation =>
  withId({
    comment: observation.comment ?? '',
    time: ordTimeToReaction(observation.time),
    image: ordDataToReaction(observation?.image, 'Observation'),
  });

export const reactionObservationToOrd = (observation: ReactionObservation): ord.IReactionObservation => {
  return {
    comment: observation.comment,
    image: reactionDataToOrd(observation.image),
    time: reactionTimeToOrd(observation.time),
  };
};
