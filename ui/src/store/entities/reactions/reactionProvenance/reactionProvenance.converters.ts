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
  withoutId,
  withId,
  ordDateTimeToReaction,
  reactionDateTimeToOrd,
} from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import type { ReactionProvenance, ReactionRecordEvent } from './reactionProvenance.types.ts';
import type { Optional, OrdOptional } from '../reactionEntity/reactionEntity.types.ts';

export const ordPersonToReactionPerson = (person: OrdOptional<ord.IPerson>): ord.IPerson => {
  return person ?? ord.Person.toObject(new ord.Person());
};

export const reactionPersonToOrdPerson = (person: ord.IPerson): Optional<ord.IPerson> => {
  return person;
};

export const ordRecordEventToReaction = (recordEvent: OrdOptional<ord.IRecordEvent>): ReactionRecordEvent => {
  const { person, time, details }: ord.IRecordEvent = recordEvent ?? ord.RecordEvent.toObject(new ord.RecordEvent());
  return withId({
    time: ordDateTimeToReaction(time),
    details: details,
    person: ordPersonToReactionPerson(person),
  });
};

export const reactionRecordEventToOrd = ({ person, time, details }: ReactionRecordEvent): ord.IRecordEvent => ({
  time: reactionDateTimeToOrd(time),
  details: details,
  person: reactionPersonToOrdPerson(person),
});

export const ordProvenanceToReactionProvenance = (
  provenance: OrdOptional<ord.IReactionProvenance>,
): ReactionProvenance => {
  const existingProvenance: ord.IReactionProvenance =
    provenance ?? ord.ReactionProvenance.toObject(new ord.ReactionProvenance());
  const { experimentStart, recordModified, experimenter, recordCreated, ...rest } = existingProvenance;

  return withId({
    experimentStart: ordDateTimeToReaction(experimentStart),
    recordModified: (recordModified || []).map(ordRecordEventToReaction),
    experimenter: ordPersonToReactionPerson(experimenter),
    recordCreated: ordRecordEventToReaction(recordCreated),
    ...rest,
  });
};

export const reactionProvenanceToOrdProvenance = (provenance: ReactionProvenance): ord.IReactionProvenance => {
  const { experimentStart, recordModified, experimenter, recordCreated, ...rest } = withoutId(provenance);

  return {
    experimentStart: reactionDateTimeToOrd(experimentStart),
    recordModified: recordModified.map(reactionRecordEventToOrd),
    experimenter: reactionPersonToOrdPerson(experimenter),
    recordCreated: reactionRecordEventToOrd(recordCreated),
    ...rest,
  };
};
