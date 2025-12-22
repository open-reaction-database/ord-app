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
import type { ReactionDateTime, WithId } from '../reactionEntity/reactionEntity.types.ts';

export interface ReactionRecordEvent extends WithId<Pick<ord.IRecordEvent, 'details'>> {
  time: ReactionDateTime;
  person: ord.IPerson;
}

export interface ReactionProvenance extends Omit<
  ord.IReactionProvenance,
  'experimentStart' | 'recordModified' | 'experimenter' | 'recordCreated'
> {
  id: string;
  experimentStart: ReactionDateTime;
  experimenter: ord.IPerson;
  recordCreated: ReactionRecordEvent;
  recordModified: Array<ReactionRecordEvent>;
}
