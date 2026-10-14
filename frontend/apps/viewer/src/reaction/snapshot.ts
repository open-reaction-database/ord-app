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
import type { ReactionSnapshot } from '@open-reaction-database/ui/reaction';
import {
  getReactionPreviews,
  ordBinpbToReaction,
} from '@open-reaction-database/ui/reaction/model';
import type { ReactionRecord } from '#api/types.ts';

// The viewer's API returns no summary. ReactionCard renders only when it has one, and
// reads its contents only for the details the viewer leaves off.
const EMPTY_SUMMARY = { provenance: {}, summary: {}, conditions: '' };

/** The record as the shared view reads it: its reaction, molblocks, and ORD ID. */
export function recordToSnapshot(record: ReactionRecord): ReactionSnapshot {
  const data = ordBinpbToReaction(record.binpb);
  return {
    data,
    previews: getReactionPreviews(data, record.molblocks),
    summary: EMPTY_SUMMARY,
    pb_reaction_id: record.reaction_id,
  };
}
