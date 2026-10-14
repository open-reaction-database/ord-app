/*
 * Copyright 2026 Open Reaction Database Project Authors
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
import { fromBinary, toJson } from '@bufbuild/protobuf';
import { base64Decode } from '@bufbuild/protobuf/wire';
import { ReactionSchema } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import type { ReactionRecord } from '#api/types.ts';

/** The record's reaction as ord-schema's protobuf JSON, indented. */
export function fullRecordJson(record: ReactionRecord): string {
  const reaction = fromBinary(ReactionSchema, base64Decode(record.binpb));
  return JSON.stringify(toJson(ReactionSchema, reaction), null, 2);
}
