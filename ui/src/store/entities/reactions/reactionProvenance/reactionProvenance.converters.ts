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
import { create, type MessageInitShape } from '@bufbuild/protobuf';
import {
  PersonSchema,
  ReactionProvenanceSchema,
  RecordEventSchema,
  type Person,
  type ReactionProvenance as OrdReactionProvenance,
  type RecordEvent,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import {
  withoutId,
  withId,
  ordDateTimeToReaction,
  ordScalarToReaction,
  reactionDateTimeToOrd,
} from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import type {
  ReactionPerson,
  ReactionProvenance,
  ReactionRecordEvent,
} from './reactionProvenance.types.ts';
import type { OrdOptional } from '../reactionEntity/reactionEntity.types.ts';

export const ordPersonToReactionPerson = (
  person: OrdOptional<Person>,
): ReactionPerson => {
  const { username, name, orcid, organization, email } = person ?? create(PersonSchema);
  return {
    username: ordScalarToReaction(username),
    name: ordScalarToReaction(name),
    orcid: ordScalarToReaction(orcid),
    organization: ordScalarToReaction(organization),
    email: ordScalarToReaction(email),
  };
};

export const reactionPersonToOrdPerson = ({
  username,
  name,
  orcid,
  organization,
  email,
}: ReactionPerson): MessageInitShape<typeof PersonSchema> => ({
  username: username ?? undefined,
  name: name ?? undefined,
  orcid: orcid ?? undefined,
  organization: organization ?? undefined,
  email: email ?? undefined,
});

export const ordRecordEventToReaction = (
  recordEvent: OrdOptional<RecordEvent>,
): ReactionRecordEvent => {
  const { time, details, person } = recordEvent ?? create(RecordEventSchema);
  return withId({
    time: ordDateTimeToReaction(time),
    details: ordScalarToReaction(details),
    person: ordPersonToReactionPerson(person),
  });
};

export const reactionRecordEventToOrd = ({
  person,
  time,
  details,
}: ReactionRecordEvent): MessageInitShape<typeof RecordEventSchema> => ({
  time: reactionDateTimeToOrd(time),
  details: details ?? undefined,
  person: reactionPersonToOrdPerson(person),
});

export const ordProvenanceToReaction = (
  provenance: OrdOptional<OrdReactionProvenance>,
): ReactionProvenance => {
  const {
    experimentStart,
    recordModified,
    experimenter,
    recordCreated,
    city,
    doi,
    patent,
    publicationUrl,
    isMined,
    reactionMetadata,
  } = provenance ?? create(ReactionProvenanceSchema);

  return withId({
    experimentStart: ordDateTimeToReaction(experimentStart),
    recordModified: recordModified.map(ordRecordEventToReaction),
    experimenter: ordPersonToReactionPerson(experimenter),
    recordCreated: ordRecordEventToReaction(recordCreated),
    city: ordScalarToReaction(city),
    doi: ordScalarToReaction(doi),
    patent: ordScalarToReaction(patent),
    publicationUrl: ordScalarToReaction(publicationUrl),
    isMined,
    reactionMetadata,
  });
};

export const reactionProvenanceToOrd = (
  provenance: ReactionProvenance,
): MessageInitShape<typeof ReactionProvenanceSchema> => {
  const {
    experimentStart,
    recordModified,
    experimenter,
    recordCreated,
    city,
    doi,
    patent,
    publicationUrl,
    isMined,
    reactionMetadata,
  } = withoutId(provenance);

  return {
    experimentStart: reactionDateTimeToOrd(experimentStart),
    recordModified: recordModified.map(reactionRecordEventToOrd),
    experimenter: reactionPersonToOrdPerson(experimenter),
    recordCreated: reactionRecordEventToOrd(recordCreated),
    city: city ?? undefined,
    doi: doi ?? undefined,
    patent: patent ?? undefined,
    publicationUrl: publicationUrl ?? undefined,
    isMined: isMined ?? undefined,
    reactionMetadata,
  };
};
