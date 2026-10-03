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
import type { JsonValue } from '@bufbuild/protobuf';
import type {
  Optional,
  ReactionDateTime,
  ReactionEntity,
} from '../reactionEntity/reactionEntity.types.ts';

export interface ReactionPerson {
  username?: Optional<string>;
  name?: Optional<string>;
  orcid?: Optional<string>;
  organization?: Optional<string>;
  email?: Optional<string>;
}

export interface ReactionRecordEvent extends ReactionEntity {
  details?: Optional<string>;
  time: ReactionDateTime;
  person: ReactionPerson;
}

export interface ReactionProvenance extends ReactionEntity {
  city?: Optional<string>;
  doi?: Optional<string>;
  patent?: Optional<string>;
  publicationUrl?: Optional<string>;
  isMined?: Optional<boolean>;
  // Not edited in the app; carried through so that saving a reaction keeps it. Each value is
  // the proto3 JSON of an ord Data message, which, unlike its bytes, Redux can serialize.
  reactionMetadata?: Record<string, JsonValue>;
  experimentStart: ReactionDateTime;
  experimenter: ReactionPerson;
  recordCreated: ReactionRecordEvent;
  recordModified: Array<ReactionRecordEvent>;
}
